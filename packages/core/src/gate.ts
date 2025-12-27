import crypto from "crypto";
import { BudgetExceededError, PolicyError } from "./errors.js";
import type { PolicyProvider, TenantPolicy } from "./policy.js";
import type { BudgetLedger, Reservation } from "./budget/ledger.js";
import { windowStartMs } from "./budget/window.js";
import { computeActualUsd, estimateUsd, type PricingTable } from "./pricing.js";
import type { ReceiptSink } from "./audit/sink.js";
import type { ReceiptSigner } from "./audit/signer.js";
import type { AuditReceipt, Usage } from "./audit/receipt.js";
import { NoopTelemetry, type Telemetry } from "./telemetry.js";

export interface GateDeps {
  policyProvider: PolicyProvider;
  ledger: BudgetLedger;
  pricing: PricingTable;
  signer: ReceiptSigner;
  sink: ReceiptSink;
  telemetry?: Telemetry;
  nowMs?: () => number;
}

export interface GateCall {
  tenantId: string;
  runId: string;
  requestId: string;

  provider: string;
  model: string;
  operation: string;

  stream: boolean;

  inputTokensUpperBound: number;
  outputTokensUpperBound: number;

  execute: (args: { policy: TenantPolicy; reservation: Reservation }) => Promise<{
    ok: boolean;
    status: number;
    providerRequestId?: string;
    usage?: Usage;        // present for non-stream or when stream usage is available
    // If execute throws, we capture error in receipt.
  }>;
}

export class Gate {
  private readonly policyProvider: PolicyProvider;
  private readonly ledger: BudgetLedger;
  private readonly pricing: PricingTable;
  private readonly signer: ReceiptSigner;
  private readonly sink: ReceiptSink;
  private readonly telemetry: Telemetry;
  private readonly nowMs: () => number;

  constructor(deps: GateDeps) {
    this.policyProvider = deps.policyProvider;
    this.ledger = deps.ledger;
    this.pricing = deps.pricing;
    this.signer = deps.signer;
    this.sink = deps.sink;
    this.telemetry = deps.telemetry ?? NoopTelemetry;
    this.nowMs = deps.nowMs ?? (() => Date.now());
  }

  async call<T extends GateCall>(c: T): Promise<Awaited<ReturnType<T["execute"]>>> {
    return await this.telemetry.span("aegis.gate.call", { provider: c.provider, model: c.model, op: c.operation }, async () => {
      const policy = await this.policyProvider.getPolicy({ tenantId: c.tenantId });

      if (!policy.capabilities.includes("llm:invoke")) {
        throw new PolicyError(`Missing capability llm:invoke for tenant ${c.tenantId}`);
      }
      if (!policy.model.allowModels.includes(c.model)) {
        throw new PolicyError(`Model not allowed: ${c.model}`);
      }
      // Routing (v1): ensure provider is allowed by policy primary/fallback.
      const allowedProviders = new Set([policy.routing.primaryProvider, ...(policy.routing.fallbackProviders ?? [])]);
      if (!allowedProviders.has(c.provider as any)) {
        throw new PolicyError(`Provider not allowed: ${c.provider}`);
      }

      const now = this.nowMs();
      const winStart = windowStartMs(now, policy.budgets.perWindow.window);
      const estUsd = estimateUsd({
        pricing: this.pricing,
        provider: c.provider,
        model: c.model,
        inputTokensUpperBound: c.inputTokensUpperBound,
        outputTokensUpperBound: c.outputTokensUpperBound
      });

      const { reservation, snapshot } = await this.ledger.reserve({
        tenantId: c.tenantId,
        runId: c.runId,
        window: policy.budgets.perWindow.window,
        windowStartMs: winStart,
        windowLimitUsd: policy.budgets.perWindow.limitUsd,
        runLimitUsd: policy.budgets.perRunUsd,
        estimatedUsd: estUsd,
        nowMs: now
      });

      // If reservation.estimatedUsd is 0, we treat as denied (see MemoryLedger).
      if (reservation.estimatedUsd <= 0) {
        throw new BudgetExceededError({
          remainingUsd: Math.min(snapshot.remainingRunUsd, snapshot.remainingWindowUsd),
          neededUsd: estUsd
        });
      }

      let execResult:
        | { ok: boolean; status: number; providerRequestId?: string; usage?: Usage }
        | undefined;
      let errorCode: string | undefined;
      let errorMessage: string | undefined;

      try {
        execResult = await c.execute({ policy, reservation });
      } catch (err: unknown) {
        errorCode = err instanceof Error ? err.name : "UnknownError";
        errorMessage = err instanceof Error ? err.message : String(err);
        execResult = { ok: false, status: 500 };
      }

      // Commit actual if usage is known; otherwise commit estimated (still safe).
      const actualUsd = execResult.usage
        ? computeActualUsd({
            pricing: this.pricing,
            provider: c.provider,
            model: c.model,
            inputTokens: execResult.usage.inputTokens,
            outputTokens: execResult.usage.outputTokens
          })
        : reservation.estimatedUsd;

      await this.ledger.commit({ reservationId: reservation.reservationId, actualUsd });

      const result: AuditReceipt["result"] = {
        ok: execResult.ok,
        status: execResult.status,
        estimatedUsd: reservation.estimatedUsd,

        ...(execResult.providerRequestId ? { providerRequestId: execResult.providerRequestId } : {}),
        ...(execResult.usage ? { usage: execResult.usage } : {}),
        ...(execResult.usage ? { actualUsd } : {}),

        ...(errorCode ? { errorCode } : {}),
        ...(errorMessage ? { errorMessage } : {})
      };

      const receiptUnsigned = {
        v: 1 as const,
        receiptId: crypto.randomUUID(),
        tsMs: now,

        tenantId: c.tenantId,
        runId: c.runId,

        provider: c.provider,
        model: c.model,
        operation: c.operation,

        request: {
          requestId: c.requestId,
          stream: c.stream,
          inputTokensUpperBound: c.inputTokensUpperBound,
          outputTokensUpperBound: c.outputTokensUpperBound
        },

        result
      };

      const sig = await this.signer.sign(receiptUnsigned);
      const receipt: AuditReceipt = {
        ...receiptUnsigned,
        signature: { alg: "HS256", keyId: this.signer.keyId, sig }
      };

      await this.sink.write(receipt);

      this.telemetry.metric("aegis.usd", actualUsd, { provider: c.provider, model: c.model });

      return execResult as Awaited<ReturnType<T["execute"]>>;
    });
  }
}
