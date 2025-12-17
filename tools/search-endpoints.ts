import { z } from "zod";
import { getParsedOpenAPI } from "../parser.js";

export const searchEndpointsTool = {
  name: "search_endpoints",
  config: {
    title: "Search Endpoints",
    description:
      "Search for endpoints by path, summary, description, or operationId. Returns matching endpoints.",
    inputSchema: {
      query: z
        .string()
        .describe(
          "Search query to match against path, summary, description, or operationId"
        ),
    },
  },
  handler: async ({ query }: { query: string }) => {
    const parsed = getParsedOpenAPI();
    const lowerQuery = query.toLowerCase();

    const results = parsed.endpoints
      .filter((e) => {
        const searchFields = [
          e.path,
          e.summary,
          e.description,
          e.operationId,
          ...(e.tags || []),
        ].filter(Boolean);

        return searchFields.some((field) =>
          field?.toLowerCase().includes(lowerQuery)
        );
      })
      .map((e) => ({
        path: e.path,
        method: e.method.toUpperCase(),
        operationId: e.operationId,
        summary: e.summary,
        tags: e.tags,
      }));

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No endpoints found matching "${query}". Try a different search term or use list_endpoints to see all.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
};
