#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseArgs, printUsage, type CliOptions } from "./cli.js";
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
