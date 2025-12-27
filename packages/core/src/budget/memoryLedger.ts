import crypto from "crypto";
import type { BudgetLedger, LedgerSnapshot, Reservation } from "./ledger.js";

type Key = string;

function kWindow(tenantId: string, window: string, windowStartMs: number): Key {
  return `w:${tenantId}:${window}:${windowStartMs}`;
}
function kRun(tenantId: string, runId: string): Key {
  return `r:${tenantId}:${runId}`;
}

interface State {
  spendUsd: number;
}

interface ReservationState {
  reservation: Reservation;
  committed: boolean;
}

export class MemoryLedger implements BudgetLedger {
  private readonly windows = new Map<Key, State>();
  private readonly runs = new Map<Key, State>();
  private readonly reservations = new Map<string, ReservationState>();

  async reserve(args: {
    tenantId: string;
    runId: string;
    window: string;
    windowStartMs: number;
    windowLimitUsd: number;
    runLimitUsd: number;
    estimatedUsd: number;
    nowMs: number;
  }): Promise<{ reservation: Reservation; snapshot: LedgerSnapshot }> {
    const wKey = kWindow(args.tenantId, args.window, args.windowStartMs);
    const rKey = kRun(args.tenantId, args.runId);

    const w = this.windows.get(wKey) ?? { spendUsd: 0 };
    const r = this.runs.get(rKey) ?? { spendUsd: 0 };

    const remainingWindowUsd = Math.max(0, args.windowLimitUsd - w.spendUsd);
    const remainingRunUsd = Math.max(0, args.runLimitUsd - r.spendUsd);

    // Note: reservation must fit BOTH limits (hard stop)
    if (args.estimatedUsd > remainingWindowUsd || args.estimatedUsd > remainingRunUsd) {
      const snap = snapshot(args.windowLimitUsd, args.runLimitUsd, w.spendUsd, r.spendUsd);
      return {
        reservation: makeReservation(args, 0),
        snapshot: snap
      };
    }

    // Reserve by incrementing spend immediately (pessimistic / safe)
    w.spendUsd += args.estimatedUsd;
    r.spendUsd += args.estimatedUsd;

    this.windows.set(wKey, w);
    this.runs.set(rKey, r);

    const reservation = makeReservation(args, args.estimatedUsd);
    this.reservations.set(reservation.reservationId, { reservation, committed: false });

    return { reservation, snapshot: snapshot(args.windowLimitUsd, args.runLimitUsd, w.spendUsd, r.spendUsd) };
  }

  async commit(args: { reservationId: string; actualUsd: number }): Promise<{ snapshot: LedgerSnapshot }> {
    const rs = this.reservations.get(args.reservationId);
    if (!rs) throw new Error(`Unknown reservationId: ${args.reservationId}`);
    if (rs.committed) return { snapshot: await this._peekFromReservation(rs.reservation) };

    rs.committed = true;

    const { reservation } = rs;
    const wKey = kWindow(reservation.tenantId, reservation.window, reservation.windowStartMs);
    const rKey = kRun(reservation.tenantId, reservation.runId);

    const w = this.windows.get(wKey) ?? { spendUsd: 0 };
    const r = this.runs.get(rKey) ?? { spendUsd: 0 };

    // Reconcile: we already charged estimatedUsd. Apply delta.
    const delta = args.actualUsd - reservation.estimatedUsd;
    w.spendUsd = Math.max(0, w.spendUsd + delta);
    r.spendUsd = Math.max(0, r.spendUsd + delta);

    this.windows.set(wKey, w);
    this.runs.set(rKey, r);

    // We need limits to compute remaining; limits come from caller at peek time.
    // For commit-time snapshot we return "unknown limits" as zeros, caller should call peek().
    return {
      snapshot: {
        windowSpendUsd: w.spendUsd,
        runSpendUsd: r.spendUsd,
        windowLimitUsd: 0,
        runLimitUsd: 0,
        remainingWindowUsd: 0,
        remainingRunUsd: 0
      }
    };
  }

  async peek(args: {
    tenantId: string;
    runId: string;
    window: string;
    windowStartMs: number;
    windowLimitUsd: number;
    runLimitUsd: number;
  }): Promise<LedgerSnapshot> {
    const wKey = kWindow(args.tenantId, args.window, args.windowStartMs);
    const rKey = kRun(args.tenantId, args.runId);

    const w = this.windows.get(wKey) ?? { spendUsd: 0 };
    const r = this.runs.get(rKey) ?? { spendUsd: 0 };

    return snapshot(args.windowLimitUsd, args.runLimitUsd, w.spendUsd, r.spendUsd);
  }

  private async _peekFromReservation(res: Reservation): Promise<LedgerSnapshot> {
    // Limits are unknown here; this is only used to make commit idempotent.
    const wKey = kWindow(res.tenantId, res.window, res.windowStartMs);
    const rKey = kRun(res.tenantId, res.runId);
    const w = this.windows.get(wKey) ?? { spendUsd: 0 };
    const r = this.runs.get(rKey) ?? { spendUsd: 0 };
    return {
      windowSpendUsd: w.spendUsd,
      runSpendUsd: r.spendUsd,
      windowLimitUsd: 0,
      runLimitUsd: 0,
      remainingWindowUsd: 0,
      remainingRunUsd: 0
    };
  }
}

function makeReservation(
  args: {
    tenantId: string;
    runId: string;
    window: string;
    windowStartMs: number;
    estimatedUsd: number;
    nowMs: number;
  },
  chargedUsd: number
): Reservation {
  return {
    reservationId: crypto.randomUUID(),
    tenantId: args.tenantId,
    runId: args.runId,
    window: args.window as any,
    windowStartMs: args.windowStartMs,
    estimatedUsd: chargedUsd,
    createdAtMs: args.nowMs
  };
}

function snapshot(windowLimitUsd: number, runLimitUsd: number, windowSpendUsd: number, runSpendUsd: number): LedgerSnapshot {
  return {
    windowSpendUsd,
    runSpendUsd,
    windowLimitUsd,
    runLimitUsd,
    remainingWindowUsd: Math.max(0, windowLimitUsd - windowSpendUsd),
    remainingRunUsd: Math.max(0, runLimitUsd - runSpendUsd)
  };
}
