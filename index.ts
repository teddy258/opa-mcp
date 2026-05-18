#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseOpenAPI } from "./parser.js";
import {
  getApiInfoTool,
  listTagsTool,
  listEndpointsTool,
  getEndpointsByTagTool,
  getEndpointDetailTool,
  listSchemasTool,
  getSchemaTool,
  searchEndpointsTool,
  refreshSpecTool,
} from "./tools/index.js";

interface CliOptions {
  openapiUrl: string;
  headers: Record<string, string>;
}

function printUsage() {
  console.error("Usage: opamcp <openapi-url> [--header \"Name: Value\"]");
  console.error(
    "Example: opamcp https://petstore3.swagger.io/api/v3/openapi.json"
  );
  console.error(
    "Example with headers: opamcp https://example.com/openapi.json --header \"Authorization: Bearer token\""
  );
}

function parseHeader(header: string): [string, string] {
  const separatorIndex = header.indexOf(":");
  if (separatorIndex <= 0) {
    throw new Error(`Invalid header format: ${header}`);
  }

  const name = header.slice(0, separatorIndex).trim();
  const value = header.slice(separatorIndex + 1).trim();

  if (!name) {
    throw new Error(`Invalid header name: ${header}`);
  }

  return [name, value];
}

function parseHeadersJson(headersJson: string): Record<string, string> {
  const parsed = JSON.parse(headersJson) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("--headers must be a JSON object");
  }

  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      throw new Error(`Header value for "${name}" must be a string`);
    }
    headers[name] = value;
  }

  return headers;
}

function parseArgs(args: string[]): CliOptions {
  const headers: Record<string, string> = {};
  let openapiUrl: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--header" || arg === "-H") {
      const header = args[index + 1];
      if (!header) {
        throw new Error(`${arg} requires a value`);
      }
      const [name, value] = parseHeader(header);
      headers[name] = value;
      index += 1;
      continue;
    }

    if (arg?.startsWith("--header=")) {
      const [name, value] = parseHeader(arg.slice("--header=".length));
      headers[name] = value;
      continue;
    }

    if (arg === "--headers") {
      const headersJson = args[index + 1];
      if (!headersJson) {
        throw new Error("--headers requires a JSON object value");
      }
      Object.assign(headers, parseHeadersJson(headersJson));
      index += 1;
      continue;
    }

    if (arg?.startsWith("--headers=")) {
      Object.assign(headers, parseHeadersJson(arg.slice("--headers=".length)));
      continue;
    }

    if (arg?.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (openapiUrl) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    openapiUrl = arg ?? null;
  }

  if (!openapiUrl) {
    throw new Error("OpenAPI URL is required");
  }

  return { openapiUrl, headers };
}

async function main() {
  // Get OpenAPI URL from command line arguments
  const args = process.argv.slice(2);

  let options: CliOptions;
  try {
    options = parseArgs(args);
  } catch (error) {
    printUsage();
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }

  const { openapiUrl, headers } = options;

  // Parse the OpenAPI spec
  console.error(`Loading OpenAPI spec from: ${openapiUrl}`);
  const headerCount = Object.keys(headers).length;
  if (headerCount > 0) {
    console.error(`Using ${headerCount} custom HTTP header(s)`);
  }

  try {
    const parsed = await parseOpenAPI(openapiUrl, { headers });
    console.error(`Loaded: ${parsed.info.title} v${parsed.info.version}`);
    console.error(`  - ${parsed.endpoints.length} endpoints`);
    console.error(`  - ${parsed.tags.length} tags`);
    console.error(`  - ${parsed.schemas.size} schemas`);
  } catch (error) {
    console.error(
      `Failed to load OpenAPI spec: ${
        error instanceof Error ? error.message : error
      }`
    );
    process.exit(1);
  }

  // Create MCP server
  const server = new McpServer({
    name: "opamcp",
    version: "1.0.0",
  });

  // Register all tools using the new registerTool API
  server.registerTool(
    getApiInfoTool.name,
    getApiInfoTool.config,
    getApiInfoTool.handler
  );

  server.registerTool(
    listTagsTool.name,
    listTagsTool.config,
    listTagsTool.handler
  );

  server.registerTool(
    listEndpointsTool.name,
    listEndpointsTool.config,
    listEndpointsTool.handler
  );

  server.registerTool(
    getEndpointsByTagTool.name,
    getEndpointsByTagTool.config,
    getEndpointsByTagTool.handler
  );

  server.registerTool(
    getEndpointDetailTool.name,
    getEndpointDetailTool.config,
    getEndpointDetailTool.handler
  );

  server.registerTool(
    listSchemasTool.name,
    listSchemasTool.config,
    listSchemasTool.handler
  );

  server.registerTool(
    getSchemaTool.name,
    getSchemaTool.config,
    getSchemaTool.handler
  );

  server.registerTool(
    searchEndpointsTool.name,
    searchEndpointsTool.config,
    searchEndpointsTool.handler
  );

  server.registerTool(
    refreshSpecTool.name,
    refreshSpecTool.config,
    refreshSpecTool.handler
  );

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
