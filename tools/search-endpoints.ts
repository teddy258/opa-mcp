import { z } from "zod";
import { getParsedOpenAPI } from "../parser.js";

function normalizeForSearch(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export const searchEndpointsTool = {
  name: "search_endpoints",
  config: {
    title: "Search Endpoints",
    description:
      "Search endpoints by path, summary, description, operationId, or tags. Supports multiple keywords separated by spaces (e.g. 'login signIn' or 'auth signIn'). If a keyword matches a tag name, it acts as a tag filter.",
    inputSchema: {
      query: z
        .string()
        .describe(
          "Search query. You can pass multiple keywords separated by spaces (e.g. 'login signIn', 'auth signIn')."
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .describe("Maximum number of results to return (default: 50)"),
    },
  },
  handler: async ({ query, limit }: { query: string; limit?: number }) => {
    const parsed = getParsedOpenAPI();
    const trimmed = query.trim();
    const tokens = Array.from(
      new Set(
        trimmed
          .split(/\s+/)
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

    if (tokens.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: 'Empty query. Try something like "login signIn" or "auth signIn".',
          },
        ],
      };
    }

    const tagNameByNorm = new Map<string, string>();
    for (const tag of parsed.tags) {
      if (!tag.name) continue;
      tagNameByNorm.set(tag.name.toLowerCase(), tag.name);
      tagNameByNorm.set(normalizeForSearch(tag.name), tag.name);
    }

    const tagFilters: string[] = [];
    const textTokens: string[] = [];
    for (const token of tokens) {
      const norm = normalizeForSearch(token);
      const canonicalTag =
        tagNameByNorm.get(token.toLowerCase()) ?? tagNameByNorm.get(norm);
      if (canonicalTag) tagFilters.push(canonicalTag);
      else textTokens.push(token);
    }

    const max = limit ?? 50;

    const scored = parsed.endpoints
      .map((e) => {
        const endpointTags = e.tags ?? [];
        const endpointTagNorms = new Set(
          endpointTags.map((t) => normalizeForSearch(t))
        );

        // If query contains tag-like tokens, require those tags.
        const tagOk =
          tagFilters.length === 0 ||
          tagFilters.every((t) => endpointTagNorms.has(normalizeForSearch(t)));
        if (!tagOk) return null;

        const fields = [
          e.path,
          e.operationId,
          e.summary,
          e.description,
          ...endpointTags,
        ].filter(Boolean) as string[];
        const fieldsLower = fields.map((f) => f.toLowerCase());
        const fieldsNorm = fields.map((f) => normalizeForSearch(f));

        const matchedTextTokens: string[] = [];
        for (const token of textTokens) {
          const tLower = token.toLowerCase();
          const tNorm = normalizeForSearch(token);
          const hit =
            fieldsLower.some((f) => f.includes(tLower)) ||
            (tNorm.length > 0 && fieldsNorm.some((f) => f.includes(tNorm)));
          if (hit) matchedTextTokens.push(token);
        }

        // If there are no text tokens (only tags), tagOk is enough.
        // Otherwise: OR semantics across text tokens.
        const textOk = textTokens.length === 0 || matchedTextTokens.length > 0;
        if (!textOk) return null;

        // Simple relevance scoring:
        // - matched text tokens count
        // - phrase bonus if the full query appears
        const joinedLower = fieldsLower.join(" | ");
        const phraseBonus =
          trimmed.length >= 3 && joinedLower.includes(trimmed.toLowerCase())
            ? 2
            : 0;
        const score = matchedTextTokens.length + phraseBonus;

        return {
          score,
          endpoint: {
            path: e.path,
            method: e.method.toUpperCase(),
            operationId: e.operationId,
            summary: e.summary,
            tags: e.tags,
            matched: {
              tagFilters,
              matchedTextTokens,
            },
          },
        };
      })
      .filter(Boolean) as Array<{
      score: number;
      endpoint: {
        path: string;
        method: string;
        operationId?: string;
        summary?: string;
        tags?: string[];
        matched: { tagFilters: string[]; matchedTextTokens: string[] };
      };
    }>;

    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, max).map((x) => x.endpoint);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                message: `No endpoints found matching "${query}".`,
                hint: "Try different keywords, or use list_tags / list_endpoints. If the spec changed, run refresh_spec.",
                parsedQuery: {
                  tokens,
                  tagFilters,
                  textTokens,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              query,
              parsedQuery: {
                tokens,
                tagFilters,
                textTokens,
                mode:
                  tagFilters.length > 0
                    ? "tagFilters(AND)+text(OR)"
                    : "text(OR)",
              },
              count: results.length,
              results,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
