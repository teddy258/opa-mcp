import { validate, dereference } from "@scalar/openapi-parser";
import type { OpenAPI } from "@scalar/openapi-types";
import type {
  OpenAPIDocument,
  ParsedOpenAPI,
  EndpointSummary,
  ApiInfo,
  TagInfo,
  HttpMethod,
  HTTP_METHODS,
} from "./types.js";

// Cache for parsed OpenAPI document
let cachedOpenAPI: ParsedOpenAPI | null = null;

/**
 * Fetch OpenAPI spec from URL
 */
async function fetchSpec(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}

/**
 * Extract API info from document
 */
function extractApiInfo(doc: OpenAPIDocument): ApiInfo {
  return {
    title: doc.info?.title,
    version: doc.info?.version,
    description: doc.info?.description,
    termsOfService: doc.info?.termsOfService,
    contact: doc.info?.contact,
    license: doc.info?.license,
    servers: doc.servers?.map((s) => ({
      url: s.url,
      description: s.description,
    })),
  };
}

/**
 * Extract tags from document
 */
function extractTags(doc: OpenAPIDocument): TagInfo[] {
  const tags: TagInfo[] = [];

  // Get declared tags
  if (doc.tags) {
    for (const tag of doc.tags) {
      if (tag.name) {
        tags.push({
          name: tag.name,
          description: tag.description,
          externalDocs: tag.externalDocs,
        });
      }
    }
  }

  // Find tags used in operations but not declared
  const declaredTagNames = new Set(tags.map((t) => t.name));
  const paths = doc.paths || {};

  for (const pathItem of Object.values(paths)) {
    if (!pathItem) continue;

    for (const method of [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
      "trace",
    ] as const) {
      const operation = pathItem[method];
      if (operation?.tags) {
        for (const tagName of operation.tags) {
          if (!declaredTagNames.has(tagName)) {
            tags.push({ name: tagName });
            declaredTagNames.add(tagName);
          }
        }
      }
    }
  }

  return tags;
}

/**
 * Extract all endpoints from document
 */
function extractEndpoints(doc: OpenAPIDocument): EndpointSummary[] {
  const endpoints: EndpointSummary[] = [];
  const paths = doc.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    for (const method of [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
      "trace",
    ] as const) {
      const operation = pathItem[method];
      if (operation) {
        endpoints.push({
          path,
          method,
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags,
          deprecated: operation.deprecated,
        });
      }
    }
  }

  return endpoints;
}

/**
 * Extract schemas from components
 */
function extractSchemas(
  doc: OpenAPIDocument
): Map<string, OpenAPI.SchemaObject> {
  const schemas = new Map<string, OpenAPI.SchemaObject>();
  const componentSchemas = doc.components?.schemas || {};

  for (const [name, schema] of Object.entries(componentSchemas)) {
    if (schema && typeof schema === "object") {
      schemas.set(name, schema as OpenAPI.SchemaObject);
    }
  }

  return schemas;
}

/**
 * Parse and validate OpenAPI spec from URL
 */
export async function parseOpenAPI(url: string): Promise<ParsedOpenAPI> {
  // Fetch the spec
  const specContent = await fetchSpec(url);

  // Validate the spec (warnings only, don't fail on validation errors)
  const { valid, errors } = await validate(specContent);
  if (!valid && errors && errors.length > 0) {
    // Log validation warnings but don't fail - some valid specs fail strict validation
    console.error("Validation warnings (continuing anyway):");
    for (const err of errors.slice(0, 5)) {
      console.error(`  - ${err.message}`);
    }
    if (errors.length > 5) {
      console.error(`  ... and ${errors.length - 5} more`);
    }
  }

  // Dereference to resolve all $ref
  const { schema, errors: derefErrors } = await dereference(specContent);
  if (derefErrors && derefErrors.length > 0) {
    console.error("Warning: Some references could not be resolved:");
    for (const err of derefErrors.slice(0, 5)) {
      console.error(`  - ${err.message}`);
    }
  }

  if (!schema) {
    throw new Error(
      "Failed to parse OpenAPI spec. Please check if the URL returns a valid OpenAPI document."
    );
  }

  const doc = schema as OpenAPIDocument;

  // Build the parsed context
  const parsed: ParsedOpenAPI = {
    document: doc,
    info: extractApiInfo(doc),
    tags: extractTags(doc),
    endpoints: extractEndpoints(doc),
    schemas: extractSchemas(doc),
  };

  // Cache it
  cachedOpenAPI = parsed;

  return parsed;
}

/**
 * Get the cached parsed OpenAPI document
 */
export function getParsedOpenAPI(): ParsedOpenAPI {
  if (!cachedOpenAPI) {
    throw new Error(
      "OpenAPI spec not loaded. Please provide a valid OpenAPI URL."
    );
  }
  return cachedOpenAPI;
}

/**
 * Get operation by path and method
 */
export function getOperation(path: string, method: HttpMethod) {
  const parsed = getParsedOpenAPI();
  const pathItem = parsed.document.paths?.[path];
  if (!pathItem) {
    return null;
  }
  return pathItem[method] || null;
}

/**
 * Extract schema names referenced in an operation
 */
export function extractReferencedSchemas(
  operation: OpenAPI.Operation
): string[] {
  const schemas = new Set<string>();

  function findSchemaRefs(obj: unknown): void {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        findSchemaRefs(item);
      }
      return;
    }

    const record = obj as Record<string, unknown>;

    // Check for $ref (though after dereference, these should be resolved)
    if (typeof record.$ref === "string") {
      const match = record.$ref.match(/#\/components\/schemas\/(.+)/);
      if (match) {
        schemas.add(match[1]);
      }
    }

    // Check for schema type definitions that might have come from components
    if (record.title && typeof record.title === "string") {
      // After dereference, schemas are inlined but may retain their title
      const parsed = getParsedOpenAPI();
      if (parsed.schemas.has(record.title)) {
        schemas.add(record.title);
      }
    }

    // Recursively check nested objects
    for (const value of Object.values(record)) {
      findSchemaRefs(value);
    }
  }

  findSchemaRefs(operation);
  return Array.from(schemas);
}
