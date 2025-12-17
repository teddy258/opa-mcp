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

async function main() {
  // Get OpenAPI URL from command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: opamcp <openapi-url>");
    console.error(
      "Example: opamcp https://petstore3.swagger.io/api/v3/openapi.json"
    );
    process.exit(1);
  }

  const openapiUrl = args[0] as string;

  // Parse the OpenAPI spec
  console.error(`Loading OpenAPI spec from: ${openapiUrl}`);

  try {
    const parsed = await parseOpenAPI(openapiUrl);
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
