# @aegis-runtime/proxy

[![npm version](https://img.shields.io/npm/v/@aegis-runtime/proxy.svg)](https://www.npmjs.com/package/@aegis-runtime/proxy)
[![npm downloads](https://img.shields.io/npm/dm/@aegis-runtime/proxy.svg)](https://www.npmjs.com/package/@aegis-runtime/proxy)

**📦 Published on NPM** | Production-ready HTTP proxy server for AI/LLM governance with OpenAI-compatible API endpoints.

## Installation

```bash
npm install @aegis-runtime/proxy @aegis-runtime/core @aegis-runtime/adapters-openai
# or
pnpm add @aegis-runtime/proxy @aegis-runtime/core @aegis-runtime/adapters-openai
```

**🔗 [View on NPM](https://www.npmjs.com/package/@aegis-runtime/proxy)**

## Features

- OpenAI-compatible `/v1/chat/completions` endpoint
- Multi-provider routing support
- Environment-based configuration
- Health check endpoint
- Automatic budget enforcement
- Audit logging with signed receipts

## Quick Start

### 1. Set Environment Variables

```bash
export OPENAI_API_KEY="your-api-key"
export AEGIS_DEFAULT_PROVIDER="openai"
export PORT=8787
export AEGIS_GOVERNANCE_ENABLED="true"
export AEGIS_DEFAULT_POLICY_JSON='{
  "hardStop": true,
  "tokens": {
    "perRun": 2000,
    "perMinute": 10000,
    "perDay": 50000
  }
}'
```

### 2. Start the Server

```bash
# Using npm/pnpm script
pnpm dev

# Or directly
node dist/index.js
```

### 3. Make Requests

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "content-type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -H "x-run-id: run_123" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8787` |
| `OPENAI_API_KEY` | OpenAI API key | *required* |
| `AEGIS_DEFAULT_PROVIDER` | Default LLM provider | `"openai"` |
| `AEGIS_GOVERNANCE_ENABLED` | Enable governance | `"false"` |
| `AEGIS_DEFAULT_POLICY_JSON` | Default policy JSON | *optional* |
| `AEGIS_AUDIT_ENABLED` | Enable audit logging | `"false"` |
| `AEGIS_AUDIT_DIR` | Audit receipts directory | `".aegis/receipts"` |
| `AEGIS_STREAM_INCLUDE_USAGE` | Include usage in streams | `"false"` |

### Request Headers

| Header | Description | Required |
|--------|-------------|----------|
| `x-tenant-id` | Tenant identifier | Yes |
| `x-run-id` | Run/session identifier | Yes |

## API Endpoints

### `POST /v1/chat/completions`

OpenAI-compatible chat completions endpoint with governance.

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1694268190,
  "model": "gpt-4o-mini",
  "choices": [...],
  "usage": {...}
}
```

### `GET /healthz`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Development

```bash
# Build
pnpm build

# Run in development
pnpm dev

# Run tests
pnpm test
```

## License

MIT
