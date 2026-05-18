import { describe, expect, test } from "bun:test";
import { parseOpenAPI } from "./parser.js";

const integrationUrl = process.env.OPAMCP_INTEGRATION_OPENAPI_URL;
const integrationHeader = process.env.OPAMCP_INTEGRATION_HEADER;

const integrationTest =
  integrationUrl && integrationHeader ? test : test.skip;

function parseIntegrationHeader(header: string): Record<string, string> {
  const separatorIndex = header.indexOf(":");
  if (separatorIndex <= 0) {
    throw new Error("OPAMCP_INTEGRATION_HEADER must use 'Name: Value' format");
  }

  return {
    [header.slice(0, separatorIndex).trim()]: header
      .slice(separatorIndex + 1)
      .trim(),
  };
}

describe("OpenAPI integration fetch", () => {
  integrationTest("fetches a protected OpenAPI spec with a custom header", async () => {
    const url = integrationUrl;
    const header = integrationHeader;
    if (!url || !header) {
      throw new Error("Integration test requires URL and header env vars");
    }

    const parsed = await parseOpenAPI(url, {
      headers: parseIntegrationHeader(header),
    });

    expect(parsed.info.title).toBeTruthy();
    expect(parsed.endpoints.length).toBeGreaterThan(0);
    expect(parsed.schemas.size).toBeGreaterThan(0);
  });
});
