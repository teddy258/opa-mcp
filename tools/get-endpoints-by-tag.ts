import { z } from "zod";
import { getParsedOpenAPI } from "../parser.js";

export const getEndpointsByTagTool = {
  name: "get_endpoints_by_tag",
  description: "Get all endpoints that belong to a specific tag (API group). Use list_tags first to see available tags.",
  inputSchema: z.object({
    tag: z.string().describe("The tag name to filter endpoints by"),
  }),
  handler: async ({ tag }: { tag: string }) => {
    const parsed = getParsedOpenAPI();
    
    const endpoints = parsed.endpoints
      .filter((e) => e.tags?.includes(tag))
      .map((e) => ({
        path: e.path,
        method: e.method.toUpperCase(),
        operationId: e.operationId,
        summary: e.summary,
        deprecated: e.deprecated || undefined,
      }));
    
    if (endpoints.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No endpoints found for tag "${tag}". Use list_tags to see available tags.`,
          },
        ],
      };
    }
    
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

