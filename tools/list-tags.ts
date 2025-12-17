import { getParsedOpenAPI } from "../parser.js";

export const listTagsTool = {
  name: "list_tags",
  config: {
    title: "List Tags",
    description:
      "List all tags (API groups) in the OpenAPI spec. Tags are used to group related endpoints together. Use this to understand the structure of the API.",
    inputSchema: {},
  },
  handler: async () => {
    const parsed = getParsedOpenAPI();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(parsed.tags, null, 2),
        },
      ],
    };
  },
};
