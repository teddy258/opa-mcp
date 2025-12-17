import { z } from "zod";
import { getParsedOpenAPI } from "../parser.js";
import type { SchemaInfo } from "../types.js";

export const listSchemasTool = {
  name: "list_schemas",
  description: "List all schema names defined in components/schemas. Use this to discover available data types, then use get_schema to get the full definition.",
  inputSchema: z.object({}),
  handler: async () => {
    const parsed = getParsedOpenAPI();
    
    const schemas: SchemaInfo[] = [];
    for (const [name, schema] of parsed.schemas) {
      const schemaObj = schema as Record<string, unknown>;
      schemas.push({
        name,
        type: schemaObj.type as string | undefined,
        description: schemaObj.description as string | undefined,
      });
    }
    
    if (schemas.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No schemas found in components/schemas.",
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(schemas, null, 2),
        },
      ],
    };
  },
};

