import { z } from "zod";
import {
  getParsedOpenAPI,
  getOperation,
  extractReferencedSchemas,
} from "../parser.js";
import type { HttpMethod, EndpointDetail } from "../types.js";

export const getEndpointDetailTool = {
  name: "get_endpoint_detail",
  config: {
    title: "Get Endpoint Detail",
    description:
      "Get detailed information about a specific endpoint including parameters, request body, responses, and referenced schemas. Use list_endpoints first to find the path and method.",
    inputSchema: {
      path: z.string().describe("The endpoint path (e.g., '/users/{id}')"),
      method: z
        .enum([
          "get",
          "post",
          "put",
          "delete",
          "patch",
          "options",
          "head",
          "trace",
        ])
        .describe("The HTTP method (lowercase)"),
    },
  },
  handler: async ({ path, method }: { path: string; method: HttpMethod }) => {
    const parsed = getParsedOpenAPI();
    const operation = getOperation(path, method);

    if (!operation) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Endpoint not found: ${method.toUpperCase()} ${path}. Use list_endpoints to see available endpoints.`,
          },
        ],
      };
    }

    // Extract referenced schema names
    const referencedSchemas = extractReferencedSchemas(operation);

    // Build detailed response
    const detail: EndpointDetail = {
      path,
      method,
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description,
      tags: operation.tags,
      deprecated: operation.deprecated,
      parameters: operation.parameters as EndpointDetail["parameters"],
      requestBody: operation.requestBody as EndpointDetail["requestBody"],
      responses: operation.responses as EndpointDetail["responses"],
      security: operation.security,
      referencedSchemas,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(detail, null, 2),
        },
      ],
    };
  },
};
