# @aegis/adapters-openai

OpenAI provider adapter for Aegis Runtime with Chat Completions API support, including streaming capabilities.

## Installation

```bash
npm install @aegis/adapters-openai @aegis/core
# or
pnpm add @aegis/adapters-openai @aegis/core
```

## Features

- OpenAI Chat Completions API integration
- Server-Sent Events (SSE) streaming support
- Usage tracking and tap integration
- Automatic token estimation
- Budget-aware request handling

## Quick Start

```typescript
import { openaiChatCompletionsViaGate } from "@aegis/adapters-openai";
import { Gate } from "@aegis/core";

const response = await openaiChatCompletionsViaGate({
  gate: yourGateInstance,
  tenantId: "tenant_1",
  runId: "run_123",
  requestId: crypto.randomUUID(),
  env: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: "https://api.openai.com" // optional, defaults to OpenAI
  },
  body: {
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "Hello!" }
    ],
    stream: false // or true for streaming
  }
});
```

## API Reference

### `openaiChatCompletionsViaGate`

Main function to make OpenAI Chat Completions requests through the Aegis Gate.

```typescript
function openaiChatCompletionsViaGate(args: {
  gate: Gate;
  tenantId: string;
  runId: string;
  requestId: string;
  env: OpenAIEnv;
  body: OpenAIChatCompletionsRequest;
}): Promise<Response>;
```

### `tapSseForUsage`

Tap Server-Sent Events stream to extract usage information for budget tracking.

```typescript
function tapSseForUsage(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onUsage: (usage: Usage) => void
): ReadableStream<Uint8Array>;
```

## Streaming Support

The adapter fully supports OpenAI's streaming responses with automatic usage extraction:

```typescript
const response = await openaiChatCompletionsViaGate({
  // ... other args
  body: {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello!" }],
    stream: true,
    stream_options: { include_usage: true } // Recommended for accurate usage tracking
  }
});

// Response body is a ReadableStream
const reader = response.body!.getReader();
// ... consume stream
```

## License

MIT
