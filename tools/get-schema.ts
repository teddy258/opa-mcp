import { z } from "zod";
import { getParsedOpenAPI } from "../parser.js";

export const getSchemaTool = {
  name: "get_schema",
  description: "Get the full definition of a specific schema from components/schemas. Use list_schemas first to see available schema names.",
  inputSchema: z.object({
    name: z.string().describe("The schema name to retrieve"),
  }),
  handler: async ({ name }: { name: string }) => {
    const parsed = getParsedOpenAPI();
    const schema = parsed.schemas.get(name);
    
    if (!schema) {
      const availableSchemas = Array.from(parsed.schemas.keys()).slice(0, 10);
      return {
        content: [
          {
            type: "text" as const,
            text: `Schema "${name}" not found. Available schemas: ${availableSchemas.join(", ")}${parsed.schemas.size > 10 ? "..." : ""}. Use list_schemas to see all.`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ name, schema }, null, 2),
        },
      ],
    };
  },
};

