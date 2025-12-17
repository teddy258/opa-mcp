# opamcp

> "OpenAPI 스펙 문서 읽기 귀찮아..." 하던 AI를 위한 MCP 서버

OpenAPI 스펙 URL 하나 던져주면, AI가 알아서 API 구조를 탐색할 수 있게 해주는 도구입니다.
더 이상 "이 API 어떻게 쓰는 거야?" 라고 물을 때마다 스펙 문서 전체를 붙여넣지 않아도 됩니다.

## 어떻게 쓰나요?

```bash
npx -y opamcp https://petstore3.swagger.io/api/v3/openapi.json
```

끝. 진짜 이게 다입니다.

## Claude Desktop / Cursor 설정

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": ["-y", "opamcp", "https://your-api.com/openapi.json"]
    }
  }
}
```

## 뭘 할 수 있나요?

| 도구                   | 하는 일                           |
| ---------------------- | --------------------------------- |
| `get_api_info`         | API가 뭐하는 녀석인지 한눈에 파악 |
| `list_tags`            | API 그룹(태그) 목록 보기          |
| `list_endpoints`       | 전체 엔드포인트 훑어보기          |
| `get_endpoints_by_tag` | 특정 태그의 엔드포인트만 보기     |
| `get_endpoint_detail`  | 엔드포인트 하나 깊게 파보기       |
| `list_schemas`         | 어떤 데이터 타입들이 있는지 보기  |
| `get_schema`           | 특정 스키마 정의 자세히 보기      |
| `search_endpoints`     | 키워드로 엔드포인트 검색          |
| `refresh_spec`         | 스펙 변경됐으면 새로고침          |

## 이렇게 쓰면 됩니다

```
나: "이 API 뭐야?"
AI: (get_api_info 호출) "아, 펫샵 API네요. 반려동물 관리하는..."

나: "주문 관련 API 있어?"
AI: (search_endpoints 'order' 호출) "네, 주문 생성, 조회, 삭제 API가 있네요"

나: "주문 생성 어떻게 해?"
AI: (get_endpoint_detail '/store/order' 'post' 호출) "이렇게 하시면 됩니다..."
```

## 개발

```bash
bun install          # 의존성 설치
bun run dev <url>    # 로컬 실행
bun run build        # 빌드
```

## 라이선스

MIT - 맘대로 쓰세요

---

# English

> For AIs tired of reading OpenAPI spec documents

Just give it an OpenAPI spec URL, and your AI can explore the API structure on its own.
No more pasting entire spec documents every time someone asks "how do I use this API?"

## Quick Start

```bash
npx -y opamcp https://petstore3.swagger.io/api/v3/openapi.json
```

That's it. Really.

## Claude Desktop / Cursor Setup

```json
{
  "mcpServers": {
    "my-api": {
      "command": "npx",
      "args": ["-y", "opamcp", "https://your-api.com/openapi.json"]
    }
  }
}
```

## What can it do?

| Tool                   | What it does                           |
| ---------------------- | -------------------------------------- |
| `get_api_info`         | Get the gist of what this API is about |
| `list_tags`            | See how the API is organized           |
| `list_endpoints`       | Browse all endpoints                   |
| `get_endpoints_by_tag` | Filter endpoints by tag                |
| `get_endpoint_detail`  | Deep dive into a specific endpoint     |
| `list_schemas`         | See what data types exist              |
| `get_schema`           | Get the full schema definition         |
| `search_endpoints`     | Find endpoints by keyword              |
| `refresh_spec`         | Reload spec if it changed              |

## How it works

```
You: "What's this API?"
AI: (calls get_api_info) "It's a pet store API for managing pets..."

You: "Any order-related endpoints?"
AI: (calls search_endpoints 'order') "Yes, there's create, get, and delete order APIs"

You: "How do I create an order?"
AI: (calls get_endpoint_detail '/store/order' 'post') "Here's how..."
```

## Development

```bash
bun install          # Install deps
bun run dev <url>    # Run locally
bun run build        # Build
```

## License

MIT - Do whatever you want
