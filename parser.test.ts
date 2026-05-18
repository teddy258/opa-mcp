import { afterEach, describe, expect, test } from "bun:test";
import { parseOpenAPI, refreshOpenAPI } from "./parser.js";

const originalFetch = globalThis.fetch;

const openApiSpec = JSON.stringify({
  openapi: "3.0.0",
  info: {
    title: "Test API",
    version: "1.0.0",
  },
  paths: {
    "/pets": {
      get: {
        operationId: "listPets",
        summary: "List pets",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
  },
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("parseOpenAPI", () => {
  test("passes custom headers when fetching the spec URL", async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (url, init) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(openApiSpec, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const parsed = await parseOpenAPI("https://example.com/openapi.json", {
      headers: {
        Authorization: "Bearer token",
        "X-API-Key": "secret",
      },
    });

    expect(parsed.info.title).toBe("Test API");
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]?.url).toBe("https://example.com/openapi.json");
    expect(fetchCalls[0]?.init?.headers).toEqual({
      Authorization: "Bearer token",
      "X-API-Key": "secret",
    });
  });

  test("reuses cached custom headers when refreshing the spec", async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (url, init) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(openApiSpec, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    await parseOpenAPI("https://example.com/private-openapi.json", {
      headers: {
        Authorization: "Bearer refresh-token",
      },
    });
    await refreshOpenAPI();

    expect(fetchCalls).toHaveLength(2);
    expect(fetchCalls[1]?.url).toBe("https://example.com/private-openapi.json");
    expect(fetchCalls[1]?.init?.headers).toEqual({
      Authorization: "Bearer refresh-token",
    });
  });
});
