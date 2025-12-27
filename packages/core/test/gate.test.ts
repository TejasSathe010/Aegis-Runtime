import test from "node:test";
import assert from "node:assert/strict";
import {
  Gate,
  MemoryLedger,
  HmacSha256Signer,
  FileReceiptSink,
  type PolicyProvider,
  type TenantPolicy,
  BudgetExceededError
} from "@aegis/core";

const policy: TenantPolicy = {
  tenantId: "t1",
  budgets: {
    perRunUsd: 0.02,
    perWindow: { window: "minute", limitUsd: 0.02, hardStop: true }
  },
  routing: { primaryProvider: "openai", fallbackProviders: [] },
  model: { allowModels: ["gpt-4o-mini"] },
  capabilities: ["llm:invoke"]
};

const policyProvider: PolicyProvider = {
  async getPolicy() {
    return policy;
  }
};

test("Gate hard-stops when budget exceeded", async () => {
  const gate = new Gate({
    policyProvider,
    ledger: new MemoryLedger(),
    pricing: {
      "openai:gpt-4o-mini": { inputUsdPer1kTokens: 0.001, outputUsdPer1kTokens: 0.002 }
    },
    signer: new HmacSha256Signer({ keyId: "k1", secret: new Uint8Array([1, 2, 3]) }),
    sink: new FileReceiptSink(".tmp/receipts-test"),
    nowMs: () => 1700000000000
  });

  // estimate: input=10000 => $0.01, output=10000 => $0.02 => total $0.03 > $0.02 -> denied
  await assert.rejects(
    () =>
      gate.call({
        tenantId: "t1",
        runId: "r1",
        requestId: "req1",
        provider: "openai",
        model: "gpt-4o-mini",
        operation: "chat.completions",
        stream: false,
        inputTokensUpperBound: 10000,
        outputTokensUpperBound: 10000,
        execute: async () => ({ ok: true, status: 200 })
      }),
    (e: unknown) => e instanceof BudgetExceededError
  );
});
