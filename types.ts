import type { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";

// Supported OpenAPI document types (v3.x only)
export type OpenAPIDocument = OpenAPIV3.Document | OpenAPIV3_1.Document;

// HTTP methods supported in OpenAPI
export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "trace";

export const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "delete", "patch", "options", "head", "trace"];

// Endpoint summary for list operations
export interface EndpointSummary {
  path: string;
  method: HttpMethod;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
}

// Detailed endpoint information
export interface EndpointDetail extends EndpointSummary {
  parameters?: OpenAPI.Parameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: Record<string, {
      schema?: OpenAPI.SchemaObject;
    }>;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, {
      schema?: OpenAPI.SchemaObject;
    }>;
  }>;
  security?: OpenAPIV3.SecurityRequirementObject[];
  referencedSchemas: string[];
}

// API info
export interface ApiInfo {
  title?: string;
  version?: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name?: string;
    url?: string;
  };
  servers?: Array<{
    url?: string;
    description?: string;
  }>;
}

// Tag info
export interface TagInfo {
  name: string;
  description?: string;
  externalDocs?: {
    description?: string;
    url?: string;
  };
}

// Schema info
export interface SchemaInfo {
  name: string;
  type?: string;
  description?: string;
}

// Parsed OpenAPI context
export interface ParsedOpenAPI {
  document: OpenAPIDocument;
  info: ApiInfo;
  tags: TagInfo[];
  endpoints: EndpointSummary[];
  schemas: Map<string, OpenAPI.SchemaObject>;
}

