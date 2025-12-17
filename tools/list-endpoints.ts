import { getParsedOpenAPI } from "../parser.js";

export const listEndpointsTool = {
  name: "list_endpoints",
  config: {
    title: "List Endpoints",
    description:
      "List all API endpoints with their path, method, operationId, summary, and tags. Use this to get an overview of all available endpoints.",
    inputSchema: {},
  },
  handler: async () => {
    const parsed = getParsedOpenAPI();

    // Return a concise list
    const endpoints = parsed.endpoints.map((e) => ({
      path: e.path,
      method: e.method.toUpperCase(),
      operationId: e.operationId,
      summary: e.summary,
      tags: e.tags,
      deprecated: e.deprecated || undefined,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(endpoints, null, 2),
        },
      ],
    };
  },
};
