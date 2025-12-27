import type { BudgetWindow, TenantId } from "../policy.js";

export interface Reservation {
  reservationId: string;
  tenantId: TenantId;
  runId: string;
  window: BudgetWindow;
  windowStartMs: number;
  estimatedUsd: number;
  createdAtMs: number;
}

export interface CommitArgs {
  reservationId: string;
  actualUsd: number;
}

export interface LedgerSnapshot {
  windowSpendUsd: number;
  runSpendUsd: number;
  windowLimitUsd: number;
  runLimitUsd: number;
  remainingWindowUsd: number;
  remainingRunUsd: number;
}

export interface BudgetLedger {
  reserve(args: {
    tenantId: TenantId;
    runId: string;
    window: BudgetWindow;
    windowStartMs: number;
    windowLimitUsd: number;
    runLimitUsd: number;
    estimatedUsd: number;
    nowMs: number;
  }): Promise<{ reservation: Reservation; snapshot: LedgerSnapshot }>;

  commit(args: CommitArgs): Promise<{ snapshot: LedgerSnapshot }>;

  // Optional: best-effort read
  peek(args: {
    tenantId: TenantId;
    runId: string;
    window: BudgetWindow;
    windowStartMs: number;
    windowLimitUsd: number;
    runLimitUsd: number;
  }): Promise<LedgerSnapshot>;
}
