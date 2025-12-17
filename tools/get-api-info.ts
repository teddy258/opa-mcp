import { getParsedOpenAPI } from "../parser.js";

export const getApiInfoTool = {
  name: "get_api_info",
  config: {
    title: "Get API Info",
    description:
      "Get basic information about the API including title, version, description, and servers. Use this first to understand what the API is about.",
    inputSchema: {},
  },
  handler: async () => {
    const parsed = getParsedOpenAPI();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(parsed.info, null, 2),
        },
      ],
    };
  },
};
