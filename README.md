# Aegis Runtime

[![npm version](https://img.shields.io/npm/v/@aegis-runtime/core.svg)](https://www.npmjs.com/package/@aegis-runtime/core)
[![npm downloads](https://img.shields.io/npm/dm/@aegis-runtime/core.svg)](https://www.npmjs.com/package/@aegis-runtime/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**🚀 Published on NPM** | **Production-Ready** | **Type-Safe**

Production-ready governance and runtime controls for AI/LLM applications. Now available on NPM as a fully published, production-ready library.

**📦 NPM Packages:**
- [`@aegis-runtime/core`](https://www.npmjs.com/package/@aegis-runtime/core) - Core governance engine
- [`@aegis-runtime/adapters-openai`](https://www.npmjs.com/package/@aegis-runtime/adapters-openai) - OpenAI adapter
- [`@aegis-runtime/proxy`](https://www.npmjs.com/package/@aegis-runtime/proxy) - HTTP proxy server

## What Problem Does This Solve?

Building production AI applications is risky without proper controls:

- **Cost Overruns**: Unexpected API bills from unlimited token usage
- **No Access Control**: Anyone with API keys can use expensive models
- **Compliance Gaps**: No audit trail for regulatory requirements
- **Provider Lock-in**: Hard to switch between OpenAI, Gemini, or others
- **No Visibility**: Can't track or limit spending in real-time

Aegis Runtime solves all of these by providing policy-based governance, budget enforcement, and audit logging at the runtime layer.

## Architecture

```
┌─────────────────┐
│  Your App       │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Proxy   │  ← HTTP endpoint with governance built-in
    │  Server  │
    └────┬─────┘
         │
    ┌────▼─────┐
    │   Gate   │  ← Policy enforcement + budget management
    └────┬─────┘
         │
    ┌────▼─────┐
    │ Providers│  ← OpenAI, Gemini, etc.
    └──────────┘
```

**Core Components:**
- **Gate**: Enforces policies, manages budgets, generates audit receipts
- **Policy Provider**: Defines tenant-level permissions and limits
- **Budget Ledger**: Tracks spending across time windows (minute/hour/day/month)
- **Receipt Sink**: Stores cryptographically signed audit logs

## Tech Stack

- **TypeScript**: Full type safety, excellent developer experience
- **Node.js**: Runtime environment (18+)
- **Monorepo**: pnpm workspaces for package management
- **Zero Dependencies**: Core package has no external dependencies (except Node built-ins)
- **HTTP Proxy**: Standard Request/Response APIs (fetch compatible)

## Design Principles

1. **Policy-First**: All access control defined declaratively via policies
2. **Budget Reservation**: Prevents race conditions with reservation-based budgeting
3. **Cryptographic Audit**: Tamper-proof receipts using HMAC-SHA256
4. **Provider Agnostic**: Switch providers without code changes
5. **Runtime Enforcement**: Governance happens at request time, not configuration time
6. **Type Safety**: Full TypeScript support prevents runtime errors

## Real-World Usage

### Option 1: Proxy Server (Recommended)

Start a governance-enabled proxy server:

```bash
export OPENAI_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
export AEGIS_DEFAULT_PROVIDER="openai"
pnpm --filter @aegis-runtime/proxy dev
```

Use it like any OpenAI-compatible API:

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -H "x-run-id: run_123" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Benefits:**
- Multi-provider routing (OpenAI + Gemini)
- Budget enforcement at the HTTP layer
- No code changes needed in your application
- Works with existing OpenAI SDKs

### Option 2: Core Library

Integrate directly into your application:

```typescript
import { Gate, MemoryLedger, FileReceiptSink, HmacSha256Signer } from "@aegis-runtime/core";
import { openaiChatCompletionsViaGate } from "@aegis-runtime/adapters-openai";
import crypto from "crypto";

const policyProvider = {
  async getPolicy({ tenantId }) {
    return {
      tenantId,
      budgets: {
        perRunUsd: 1.0,
        perWindow: { window: "minute", limitUsd: 10.0, hardStop: true }
      },
      routing: { primaryProvider: "openai" },
      model: { allowModels: ["gpt-4o-mini", "gpt-4"] },
      capabilities: ["llm:invoke"]
    };
  }
};

const gate = new Gate({
  policyProvider,
  ledger: new MemoryLedger(),
  pricing: defaultPricingTable,
  signer: new HmacSha256Signer({ keyId: "k1", secret: crypto.randomBytes(32) }),
  sink: new FileReceiptSink("./receipts")
});

const response = await openaiChatCompletionsViaGate({
  gate,
  tenantId: "tenant_1",
  runId: "run_123",
  requestId: crypto.randomUUID(),
  env: { apiKey: process.env.OPENAI_API_KEY! },
  body: {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello!" }]
  }
});
```

**Benefits:**
- Full control over policies and budgets
- Custom ledger implementations (database, Redis, etc.)
- Custom audit sinks (S3, database, etc.)
- Integrates directly into your application

## Installation

**📦 Published on NPM** - Install directly from the registry:

```bash
npm install @aegis-runtime/core @aegis-runtime/adapters-openai @aegis-runtime/proxy
```

Or using pnpm:

```bash
pnpm add @aegis-runtime/core @aegis-runtime/adapters-openai @aegis-runtime/proxy
```

Or install individual packages:

```bash
# Core package only
npm install @aegis-runtime/core

# With OpenAI adapter
npm install @aegis-runtime/core @aegis-runtime/adapters-openai

# Proxy server
npm install @aegis-runtime/proxy @aegis-runtime/core @aegis-runtime/adapters-openai
```

## 📦 Published Packages

All packages are published and available on NPM:

- **[@aegis-runtime/core](https://www.npmjs.com/package/@aegis-runtime/core)** - Core governance engine (Gate, Policy, Budget, Audit)
- **[@aegis-runtime/adapters-openai](https://www.npmjs.com/package/@aegis-runtime/adapters-openai)** - OpenAI provider adapter
- **[@aegis-runtime/proxy](https://www.npmjs.com/package/@aegis-runtime/proxy)** - HTTP proxy server with multi-provider support

**✨ Status:** All packages are production-ready, fully tested, and available on NPM.

## Key Patterns

### Reservation-Based Budgeting

Prevents race conditions when multiple requests arrive simultaneously:

1. **Reserve**: Estimate cost and reserve budget before request
2. **Execute**: Make the actual LLM call
3. **Reconcile**: Update budget with actual usage
4. **Commit**: Finalize the transaction

This ensures you never exceed budgets even under concurrent load.

### Policy-Based Access Control

Access control defined as data, not code:

```typescript
{
  tenantId: "customer_a",
  budgets: { perRunUsd: 1.0, perWindow: { window: "hour", limitUsd: 100.0, hardStop: true } },
  routing: { primaryProvider: "openai", fallbackProviders: ["gemini"] },
  model: { allowModels: ["gpt-4o-mini"] },
  capabilities: ["llm:invoke"]
}
```

Policies can be stored in databases, config files, or fetched from APIs. No code changes needed to update permissions.

### Cryptographic Audit Trail

Every operation generates a signed receipt:

```typescript
{
  receiptId: "uuid",
  tenantId: "tenant_1",
  provider: "openai",
  model: "gpt-4o-mini",
  usage: { inputTokens: 100, outputTokens: 50 },
  actualUsd: 0.015,
  signature: { alg: "HS256", keyId: "k1", sig: "..." }
}
```

Receipts are tamper-proof and provide proof for compliance requirements.

## Why This Makes You an Advanced Programmer

1. **Production-Ready Thinking**: You're building with governance, not adding it later
2. **Systems Design**: You understand distributed systems patterns (reservations, reconciliation)
3. **Security First**: Cryptographic audit trails show you think about compliance
4. **Architecture Patterns**: Policy-based design, dependency injection, interface segregation
5. **Type Safety**: Full TypeScript implementation demonstrates advanced language features
6. **Observability**: Built-in telemetry and audit logging show production awareness
7. **Multi-Tenancy**: Tenant isolation and policy enforcement at scale
8. **Cost Engineering**: Budget management and reservation patterns for financial systems

## Use Cases

- **SaaS Platforms**: Per-customer budget limits and model restrictions
- **Enterprise Applications**: Compliance requirements and audit trails
- **Multi-Provider Routing**: Automatic failover and cost optimization
- **Development Teams**: Prevent accidental overspending during testing
- **Cost Control**: Real-time budget tracking and hard stops

## Quick Start

1. **Install**: `npm install @aegis-runtime/proxy @aegis-runtime/core @aegis-runtime/adapters-openai`
2. **Configure**: Set `OPENAI_API_KEY` and `GEMINI_API_KEY`
3. **Start**: `pnpm --filter @aegis-runtime/proxy dev`
4. **Use**: Make requests to `http://localhost:8787/v1/chat/completions`

See the [demo](./demo/README.md) for an interactive example.

## 🎯 Why This Matters

This library is **published to NPM**, demonstrating:
- ✅ **Production Readiness**: Fully tested and ready for real-world use
- ✅ **Developer Experience**: Easy installation via standard package managers
- ✅ **Maintainability**: Versioned releases with semantic versioning
- ✅ **Open Source**: Available to the community for collaboration
- ✅ **Professional Quality**: Clean, documented, and production-grade code

## Documentation

- [Core Package](./packages/core/README.md)
- [OpenAI Adapter](./packages/adapters-openai/README.md)
- [Proxy Server](./packages/proxy/README.md)

## License

MIT
