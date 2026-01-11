# @aegis-runtime/core

[![npm version](https://img.shields.io/npm/v/@aegis-runtime/core.svg)](https://www.npmjs.com/package/@aegis-runtime/core)
[![npm downloads](https://img.shields.io/npm/dm/@aegis-runtime/core.svg)](https://www.npmjs.com/package/@aegis-runtime/core)

**📦 Published on NPM** | Core runtime components for AI governance, policy enforcement, budget management, and audit logging.

## Installation

```bash
npm install @aegis-runtime/core
# or
pnpm add @aegis-runtime/core
```

**🔗 [View on NPM](https://www.npmjs.com/package/@aegis-runtime/core)**

## Features

- **Gate**: Main governance engine for policy enforcement and budget management
- **Policy**: Policy definition and provider interfaces for tenant-level access control
- **Budget Ledger**: Track and enforce per-run and per-window budget limits
- **Audit**: Cryptographically signed receipts for all operations
- **Pricing**: Token pricing tables for accurate USD cost estimation
- **Telemetry**: Observability hooks for monitoring and debugging

## Quick Start

```typescript
import { Gate, MemoryLedger, FileReceiptSink, HmacSha256Signer } from "@aegis-runtime/core";
import crypto from "crypto";

// Create a policy provider
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

// Create gate instance
const secret = crypto.randomBytes(32); // Generate a secure secret
const gate = new Gate({
  policyProvider,
  ledger: new MemoryLedger(),
  pricing: yourPricingTable,
  signer: new HmacSha256Signer({ keyId: "k1", secret }),
  sink: new FileReceiptSink("./receipts")
});
```

## API Reference

### Gate

The main governance engine that enforces policies and manages budgets.

```typescript
class Gate {
  constructor(deps: GateDeps);
  async call<T extends GateCall>(c: T): Promise<...>;
}
```

### Policy

Define tenant-level policies with capabilities, model allowlists, and routing rules.

```typescript
interface TenantPolicy {
  tenantId: string;
  budgets: {
    perRunUsd: number;
    perWindow: BudgetPolicy;
  };
  routing: RoutingPolicy;
  model: ModelPolicy;
  capabilities: Capability[];
}
```

### Budget Ledger

Track and enforce budget limits. Includes `MemoryLedger` for in-memory tracking and interfaces for custom ledger implementations.

```typescript
interface BudgetLedger {
  reserve(args: ReserveArgs): Promise<{ reservation: Reservation; snapshot: LedgerSnapshot }>;
  commit(args: CommitArgs): Promise<void>;
  cancel(args: CancelArgs): Promise<void>;
  snapshot(args: SnapshotArgs): Promise<LedgerSnapshot>;
}
```

### Audit

Cryptographically signed receipts for all operations. Includes `FileReceiptSink` for file-based storage and `HmacSha256Signer` for signing, plus interfaces for custom implementations.

```typescript
interface ReceiptSink {
  write(receipt: AuditReceipt): Promise<void>;
}

interface ReceiptSigner {
  keyId: string;
  sign(payload: unknown): Promise<string>;
}

// Implementation
class HmacSha256Signer implements ReceiptSigner {
  constructor(args: { keyId: string; secret: Uint8Array });
}
```

## License

MIT
