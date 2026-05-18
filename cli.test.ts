import { describe, expect, test } from "bun:test";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
  test("parses the OpenAPI URL without headers", () => {
    expect(parseArgs(["https://example.com/openapi.json"])).toEqual({
      openapiUrl: "https://example.com/openapi.json",
      headers: {},
    });
  });

  test("parses repeated header options", () => {
    expect(
      parseArgs([
        "https://example.com/openapi.json",
        "--header",
        "Authorization: Bearer token",
        "-H",
        "X-API-Key: secret",
      ])
    ).toEqual({
      openapiUrl: "https://example.com/openapi.json",
      headers: {
        Authorization: "Bearer token",
        "X-API-Key": "secret",
      },
    });
  });

  test("parses inline and JSON header options", () => {
    expect(
      parseArgs([
        "https://example.com/openapi.json",
        "--header=Authorization: Bearer token",
        "--headers",
        '{"X-API-Key":"secret","X-Tenant":"tenant-1"}',
      ])
    ).toEqual({
      openapiUrl: "https://example.com/openapi.json",
      headers: {
        Authorization: "Bearer token",
        "X-API-Key": "secret",
        "X-Tenant": "tenant-1",
      },
    });
  });

  test("rejects invalid header formats", () => {
    expect(() =>
      parseArgs(["https://example.com/openapi.json", "--header", "invalid"])
    ).toThrow("Invalid header format");
  });

  test("rejects missing URL", () => {
    expect(() => parseArgs(["--header", "Authorization: Bearer token"])).toThrow(
      "OpenAPI URL is required"
    );
  });
});
