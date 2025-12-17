# opamcp

OpenAPI MCP Server - OpenAPI 스펙을 MCP 도구로 노출하여 AI 어시스턴트가 API를 탐색할 수 있게 합니다.

## 설치 및 사용법

```bash
# npx로 바로 실행
npx -y opamcp <openapi-url>

# 예시
npx -y opamcp https://petstore3.swagger.io/api/v3/openapi.json
```

## MCP 클라이언트 설정

### Claude Desktop / Cursor

MCP 클라이언트 설정에 다음을 추가하세요:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

## 제공되는 도구

| 도구                   | 설명                                                        | 파라미터                         |
| ---------------------- | ----------------------------------------------------------- | -------------------------------- |
| `get_api_info`         | API 기본 정보 조회 (title, version, description, servers)   | -                                |
| `list_tags`            | 모든 태그(API 그룹) 목록 조회                               | -                                |
| `list_endpoints`       | 모든 엔드포인트 요약 목록 조회                              | -                                |
| `get_endpoints_by_tag` | 특정 태그에 속한 엔드포인트 조회                            | `tag: string`                    |
| `get_endpoint_detail`  | 엔드포인트 상세 정보 조회 (파라미터, 요청, 응답, 스키마 등) | `path: string`, `method: string` |
| `list_schemas`         | components/schemas의 모든 스키마 이름 조회                  | -                                |
| `get_schema`           | 특정 스키마 정의 조회                                       | `name: string`                   |
| `search_endpoints`     | path, summary, operationId로 엔드포인트 검색                | `query: string`                  |

## 권장 사용 흐름

1. **`get_api_info`** - API가 무엇인지 파악
2. **`list_tags`** - API 구조 파악
3. **`list_endpoints`** 또는 **`get_endpoints_by_tag`** - 관련 엔드포인트 찾기
4. **`get_endpoint_detail`** - 특정 엔드포인트 상세 정보 확인
5. **`list_schemas`** → **`get_schema`** - 데이터 타입 탐색

## 개발

```bash
# 의존성 설치
bun install

# 로컬 실행
bun run dev https://petstore3.swagger.io/api/v3/openapi.json

# 배포용 빌드
bun run build
```

## 라이선스

MIT

---

# English

OpenAPI MCP Server - Expose OpenAPI specs as MCP tools for AI assistants.

This MCP server parses an OpenAPI specification and provides semantic tools that allow AI assistants to explore and understand APIs step by step.

## Installation & Usage

```bash
# Run directly with npx
npx -y opamcp <openapi-url>

# Example
npx -y opamcp https://petstore3.swagger.io/api/v3/openapi.json
```

## MCP Client Configuration

### Claude Desktop / Cursor

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": [
        "-y",
        "opamcp",
        "https://petstore3.swagger.io/api/v3/openapi.json"
      ]
    }
  }
}
```

## Available Tools

| Tool                   | Description                                                     | Parameters                       |
| ---------------------- | --------------------------------------------------------------- | -------------------------------- |
| `get_api_info`         | Get API basic info (title, version, description, servers)       | -                                |
| `list_tags`            | List all tags (API groups)                                      | -                                |
| `list_endpoints`       | List all endpoints with summary                                 | -                                |
| `get_endpoints_by_tag` | Get endpoints filtered by tag                                   | `tag: string`                    |
| `get_endpoint_detail`  | Get detailed endpoint info (params, request, response, schemas) | `path: string`, `method: string` |
| `list_schemas`         | List all schema names in components/schemas                     | -                                |
| `get_schema`           | Get full schema definition                                      | `name: string`                   |
| `search_endpoints`     | Search endpoints by path, summary, or operationId               | `query: string`                  |

## Recommended Usage Flow

1. **`get_api_info`** - Understand what the API is about
2. **`list_tags`** - See how the API is organized
3. **`list_endpoints`** or **`get_endpoints_by_tag`** - Find relevant endpoints
4. **`get_endpoint_detail`** - Get detailed information about a specific endpoint
5. **`list_schemas`** → **`get_schema`** - Explore data types

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run dev https://petstore3.swagger.io/api/v3/openapi.json

# Build for distribution
bun run build
```

## License

MIT
