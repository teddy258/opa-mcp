export interface CliOptions {
  openapiUrl: string;
  headers: Record<string, string>;
}

type Env = Record<string, string | undefined>;

export function printUsage() {
  console.error("Usage: opamcp <openapi-url> [--header \"Name: Value\"]");
  console.error(
    "Example: opamcp https://petstore3.swagger.io/api/v3/openapi.json"
  );
  console.error(
    "Example with headers: opamcp https://example.com/openapi.json --header \"Authorization: Bearer token\""
  );
}

function parseHeader(header: string): [string, string] {
  const separatorIndex = header.indexOf(":");
  if (separatorIndex <= 0) {
    throw new Error(`Invalid header format: ${header}`);
  }

  const name = header.slice(0, separatorIndex).trim();
  const value = header.slice(separatorIndex + 1).trim();

  if (!name) {
    throw new Error(`Invalid header name: ${header}`);
  }

  return [name, value];
}

function parseHeadersJson(headersJson: string): Record<string, string> {
  const parsed = JSON.parse(headersJson) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("--headers must be a JSON object");
  }

  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      throw new Error(`Header value for "${name}" must be a string`);
    }
    headers[name] = value;
  }

  return headers;
}

function parseEnvHeaders(env: Env): Record<string, string> {
  const headers: Record<string, string> = {};

  if (env.OPAMCP_AUTHORIZATION) {
    headers.Authorization = env.OPAMCP_AUTHORIZATION;
  }

  if (env.OPAMCP_HEADER) {
    const [name, value] = parseHeader(env.OPAMCP_HEADER);
    headers[name] = value;
  }

  if (env.OPAMCP_HEADERS) {
    Object.assign(headers, parseHeadersJson(env.OPAMCP_HEADERS));
  }

  return headers;
}

export function parseArgs(
  args: string[],
  env: Env = process.env
): CliOptions {
  const headers: Record<string, string> = parseEnvHeaders(env);
  let openapiUrl: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--header" || arg === "-H") {
      const header = args[index + 1];
      if (!header) {
        throw new Error(`${arg} requires a value`);
      }
      const [name, value] = parseHeader(header);
      headers[name] = value;
      index += 1;
      continue;
    }

    if (arg?.startsWith("--header=")) {
      const [name, value] = parseHeader(arg.slice("--header=".length));
      headers[name] = value;
      continue;
    }

    if (arg === "--headers") {
      const headersJson = args[index + 1];
      if (!headersJson) {
        throw new Error("--headers requires a JSON object value");
      }
      Object.assign(headers, parseHeadersJson(headersJson));
      index += 1;
      continue;
    }

    if (arg?.startsWith("--headers=")) {
      Object.assign(headers, parseHeadersJson(arg.slice("--headers=".length)));
      continue;
    }

    if (arg?.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (openapiUrl) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    openapiUrl = arg ?? null;
  }

  if (!openapiUrl) {
    throw new Error("OpenAPI URL is required");
  }

  return { openapiUrl, headers };
}
