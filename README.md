# opamcp

> OpenAPI spec을 context window에 욱여넣던 시절은 끝났다.

```

   ___  _ __   __ _ _ __ ___   ___ _ __
  / _ \| '_ \ / _` | '_ ` _ \ / __| '_ \
 | (_) | |_) | (_| | | | | | | (__| |_) |
  \___/| .__/ \__,_|_| |_| |_|\___| .__/
       |_|                        |_|

```

OpenAPI 스펙 URL 하나면 충분합니다. AI가 필요할 때 필요한 만큼만 가져갑니다.

## TL;DR

```bash
npx -y opamcp@latest https://petstore3.swagger.io/api/v3/openapi.json
```

진짜 끝입니다. 더 설명이 필요하면 아래로 스크롤하세요.

## Why?

매번 이러고 계셨죠?

```
Human: 이 API 어떻게 써?
       *OpenAPI spec 10,000줄 복붙*

AI: 토큰이... 눈앞이... 캄캄...
```

이제 이렇게 됩니다:

```
Human: 이 API 어떻게 써?

AI: (get_endpoint_detail 호출)
    아, POST /orders 쓰시면 됩니다. requestBody는...
```

**Lazy loading for LLMs.** 필요한 정보만, 필요할 때.

## Setup

### Claude Desktop / Cursor

`~/.cursor/mcp.json` 또는 Claude Desktop 설정:

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
    }
  }
}
```

여러 API? 여러 서버 추가하면 됩니다:

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

## API

| Tool                   | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `get_api_info`         | 이 API가 뭔지 30초 안에 파악                           |
| `list_tags`            | API 그룹핑 구조 확인                                   |
| `list_endpoints`       | 전체 엔드포인트 인덱스                                 |
| `get_endpoints_by_tag` | 태그별 필터링                                          |
| `get_endpoint_detail`  | 단일 엔드포인트 딥다이브 (params, body, response 전부) |
| `list_schemas`         | 데이터 모델 카탈로그                                   |
| `get_schema`           | 스키마 정의 + nested refs 해석                         |
| `search_endpoints`     | 키워드 기반 엔드포인트 검색                            |
| `refresh_spec`         | 스펙 리로드 (개발 중 유용)                             |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                      Your AI                            │
└─────────────────────┬───────────────────────────────────┘
                      │ MCP Protocol
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     opamcp                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Parsed OpenAPI Spec (in memory)                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐             │  │
│  │  │ paths   │ │ schemas │ │  tags   │  ...        │  │
│  │  └─────────┘ └─────────┘ └─────────┘             │  │
│  └───────────────────────────────────────────────────┘  │
│           │              │              │               │
│     list_endpoints  get_schema  search_endpoints       │
│           │              │              │               │
│           ▼              ▼              ▼               │
│      Minimal, focused response to AI                   │
└─────────────────────────────────────────────────────────┘
```

전체 스펙을 파싱해서 메모리에 들고 있다가, AI가 필요한 부분만 쿼리합니다.

## Development

```bash
# Prerequisites: bun (https://bun.sh)

git clone https://github.com/your-username/opamcp
cd opamcp

bun install          # deps
bun run dev <url>    # local dev server
bun run build        # production build
```

### Project Structure

```
opamcp/
├── index.ts         # MCP server entry
├── parser.ts        # OpenAPI spec parser
├── types.ts         # TypeScript definitions
└── tools/           # Individual tool implementations
    ├── get-api-info.ts
    ├── get-endpoint-detail.ts
    ├── search-endpoints.ts
    └── ...
```

## Compatibility

- OpenAPI 3.0.x ✅
- OpenAPI 3.1.x ✅
- Swagger 2.0 ⚠️ (기본적인 것들은 동작, edge case 있을 수 있음)

## FAQ

**Q: 스펙이 업데이트되면?**  
A: `refresh_spec` 호출하거나, MCP 서버 재시작.

**Q: 로컬 파일도 되나요?**  
A: `file:///path/to/spec.json` 또는 `file:///path/to/spec.yaml`

**Q: YAML 지원?**  
A: 당연하죠.

**Q: Private API라 인증이 필요한데?**  
A: 스펙 URL에 접근만 가능하면 됩니다. 실제 API 호출은 AI가 별도로 합니다.

## License

MIT. Fork하든 수정하든 팔아먹든 알아서 하세요.

---

<p align="center">
  <sub>Built with ☕ and mass amounts of <code>console.log</code></sub>
</p>

---

# English

> Stop stuffing OpenAPI specs into context windows.

One URL. That's all your AI needs to explore any OpenAPI-compliant API.

## TL;DR

```bash
npx -y opamcp@latest https://petstore3.swagger.io/api/v3/openapi.json
```

Done. Scroll down if you need more.

## Why?

Before:

```
Human: How do I use this API?
       *pastes 10,000 lines of OpenAPI spec*

AI: My tokens... my context... it's all... fading...
```

After:

```
Human: How do I use this API?

AI: (calls get_endpoint_detail)
    Use POST /orders. The requestBody should be...
```

**Lazy loading for LLMs.** Right info, right time.

## Setup

### Claude Desktop / Cursor

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
    }
  }
}
```

## API

| Tool                   | Description                          |
| ---------------------- | ------------------------------------ |
| `get_api_info`         | Quick overview of the API            |
| `list_tags`            | API grouping structure               |
| `list_endpoints`       | Full endpoint index                  |
| `get_endpoints_by_tag` | Filter by tag                        |
| `get_endpoint_detail`  | Deep dive into single endpoint       |
| `list_schemas`         | Data model catalog                   |
| `get_schema`           | Schema definition with resolved refs |
| `search_endpoints`     | Keyword-based endpoint search        |
| `refresh_spec`         | Reload spec                          |

## Development

```bash
bun install          # Install deps
bun run dev <url>    # Local dev
bun run build        # Build
```

## License

MIT. Do whatever.

---

<p align="center">
  <sub>Made by developers who got tired of Ctrl+F in Swagger UI</sub>
</p>
