import { z } from "zod";
import { refreshOpenAPI, getOpenAPIUrl } from "../parser.js";

export const refreshSpecTool = {
  name: "refresh_spec",
  config: {
    title: "Refresh OpenAPI Spec",
    description:
      "Reload the OpenAPI specification from the URL to get the latest version. Use this when the API spec might have been updated.",
    inputSchema: {},
  },
  handler: async () => {
    const url = getOpenAPIUrl();
    const parsed = await refreshOpenAPI();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              message: "OpenAPI spec refreshed successfully",
              url,
              title: parsed.info.title,
              version: parsed.info.version,
              endpoints: parsed.endpoints.length,
              tags: parsed.tags.length,
              schemas: parsed.schemas.size,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
