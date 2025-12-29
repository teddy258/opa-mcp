# opamcp

MCP (Model Context Protocol) server for OpenAPI specification exploration.

Enables AI assistants to query OpenAPI specifications on-demand, eliminating the need to load entire spec documents into context.

## Features

- **On-demand querying** — Fetch only the relevant portions of an OpenAPI spec
- **Schema resolution** — Automatically resolves `$ref` references
- **Search capabilities** — Find endpoints by keyword, path, or tag
- **Zero configuration** — Single command setup with any OpenAPI spec URL

## Installation

```bash
npx -y opamcp@latest <openapi-spec-url>
```

## Quick Start

### Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

### Cursor

Add to your MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

## Available Tools

| Tool                   | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `get_api_info`         | Retrieve API metadata (title, version, servers)   |
| `list_tags`            | List all available tags with descriptions         |
| `list_endpoints`       | List all endpoints with methods and summaries     |
| `get_endpoints_by_tag` | Filter endpoints by specific tag                  |
| `get_endpoint_detail`  | Get full endpoint specification including schemas |
| `list_schemas`         | List all schema definitions                       |
| `get_schema`           | Get detailed schema with resolved references      |
| `search_endpoints`     | Search endpoints by keyword                       |
| `refresh_spec`         | Reload the OpenAPI specification                  |

## Supported Formats

| Format        | Status    |
| ------------- | --------- |
| OpenAPI 3.0.x | Supported |
| OpenAPI 3.1.x | Supported |
| Swagger 2.0   | Partial   |
| JSON          | Supported |
| YAML          | Supported |

## Configuration

### Local Files

```bash
npx -y opamcp@latest file:///path/to/openapi.json
```

### Multiple APIs

Configure multiple servers in your MCP settings:

```json
{
  "mcpServers": {
    "petstore": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"
      ]
    }
  }
}
```

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime

### Setup

```bash
git clone https://github.com/your-username/opamcp.git
cd opamcp
bun install
```

### Commands

```bash
bun run dev <url>    # Start development server
bun run build        # Build for production
```

### Project Structure

```
opamcp/
├── index.ts         # MCP server entry point
├── parser.ts        # OpenAPI specification parser
├── types.ts         # TypeScript type definitions
└── tools/           # Tool implementations
    ├── get-api-info.ts
    ├── get-endpoint-detail.ts
    ├── get-endpoints-by-tag.ts
    ├── get-schema.ts
    ├── list-endpoints.ts
    ├── list-schemas.ts
    ├── list-tags.ts
    ├── refresh-spec.ts
    └── search-endpoints.ts
```

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

## License

[MIT](LICENSE)

---

# 한국어

OpenAPI 스펙 탐색을 위한 MCP (Model Context Protocol) 서버입니다.

AI 어시스턴트가 OpenAPI 스펙을 필요에 따라 조회할 수 있도록 하여, 전체 스펙 문서를 컨텍스트에 로드할 필요를 없앱니다.

## 주요 기능

- **온디맨드 조회** — OpenAPI 스펙의 필요한 부분만 가져옴
- **스키마 참조 해석** — `$ref` 참조를 자동으로 해석
- **검색 기능** — 키워드, 경로, 태그로 엔드포인트 검색
- **설정 불필요** — OpenAPI 스펙 URL 하나로 즉시 시작

## 설치

```bash
npx -y opamcp@latest <openapi-spec-url>
```

## 빠른 시작

### Claude Desktop

Claude Desktop 설정 파일(`claude_desktop_config.json`)에 추가:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

### Cursor

MCP 설정 파일(`.cursor/mcp.json`)에 추가:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

## 사용 가능한 도구

| 도구                   | 설명                                      |
| ---------------------- | ----------------------------------------- |
| `get_api_info`         | API 메타데이터 조회 (제목, 버전, 서버)    |
| `list_tags`            | 사용 가능한 모든 태그 및 설명 조회        |
| `list_endpoints`       | 모든 엔드포인트 목록 조회                 |
| `get_endpoints_by_tag` | 특정 태그로 엔드포인트 필터링             |
| `get_endpoint_detail`  | 스키마를 포함한 엔드포인트 상세 스펙 조회 |
| `list_schemas`         | 모든 스키마 정의 목록 조회                |
| `get_schema`           | 참조가 해석된 상세 스키마 조회            |
| `search_endpoints`     | 키워드로 엔드포인트 검색                  |
| `refresh_spec`         | OpenAPI 스펙 새로고침                     |

## 지원 형식

| 형식          | 지원 상태 |
| ------------- | --------- |
| OpenAPI 3.0.x | 지원      |
| OpenAPI 3.1.x | 지원      |
| Swagger 2.0   | 부분 지원 |
| JSON          | 지원      |
| YAML          | 지원      |

## 설정

### 로컬 파일

```bash
npx -y opamcp@latest file:///path/to/openapi.json
```

### 여러 API 등록

MCP 설정에서 여러 서버 구성:

```json
{
  "mcpServers": {
    "petstore": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp@latest",
        "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"
      ]
    }
  }
}
```

## 개발

### 사전 요구사항

- [Bun](https://bun.sh) 런타임

### 설정

```bash
git clone https://github.com/your-username/opamcp.git
cd opamcp
bun install
```

### 명령어

```bash
bun run dev <url>    # 개발 서버 시작
bun run build        # 프로덕션 빌드
```

## 기여

기여를 환영합니다. Pull Request를 제출하기 전에 먼저 Issue를 통해 제안하려는 변경 사항을 논의해 주세요.

## 라이선스

[MIT](LICENSE)
