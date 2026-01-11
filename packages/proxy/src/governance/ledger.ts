type Entry = { ts: number; usd: number; tokens: number };

function purgeOld(entries: Entry[], now: number, windowMs: number) {
  const cutoff = now - windowMs;
  while (entries.length && entries[0]!.ts < cutoff) entries.shift();
}

function sum(entries: Entry[]): { usd: number; tokens: number } {
  let usd = 0;
  let tokens = 0;
  for (const e of entries) {
    usd += e.usd;
    tokens += e.tokens;
  }
  return { usd, tokens };
}

export type Reservation = {
  reservationId: string;
  tenantId: string;
  reservedUsd: number;
  reservedTokens: number;
  ts: number;
};

export class SpendLedger {
  private minute = new Map<string, Entry[]>();
  private day = new Map<string, Entry[]>();
  private reservations = new Map<string, Reservation>();

  private entries(map: Map<string, Entry[]>, tenantId: string): Entry[] {
    const e = map.get(tenantId);
    if (e) return e;
    const n: Entry[] = [];
    map.set(tenantId, n);
    return n;
  }

  current(tenantId: string, now: number) {
    const m = this.entries(this.minute, tenantId);
    const d = this.entries(this.day, tenantId);
    purgeOld(m, now, 60_000);
    purgeOld(d, now, 24 * 60 * 60_000);
    return {
      minute: sum(m),
      day: sum(d)
    };
  }

  reserve(reservationId: string, tenantId: string, reservedUsd: number, reservedTokens: number, now: number): Reservation {
    if (this.reservations.has(reservationId)) {
      return this.reservations.get(reservationId)!;
    }

    const entry: Entry = { ts: now, usd: reservedUsd, tokens: reservedTokens };
    this.entries(this.minute, tenantId).push(entry);
    this.entries(this.day, tenantId).push(entry);

    const r: Reservation = { reservationId, tenantId, reservedUsd, reservedTokens, ts: now };
    this.reservations.set(reservationId, r);
    return r;
  }

  release(reservationId: string, now: number): Reservation | null {
    const r = this.reservations.get(reservationId);
    if (!r) return null;
    const refund: Entry = { ts: now, usd: -r.reservedUsd, tokens: -r.reservedTokens };
    this.entries(this.minute, r.tenantId).push(refund);
    this.entries(this.day, r.tenantId).push(refund);
    this.reservations.delete(reservationId);
    return r;
  }

  reconcile(reservationId: string, actualUsd: number, actualTokens: number, now: number): Reservation | null {
    const r = this.reservations.get(reservationId);
    if (!r) return null;

    const usdDiff = actualUsd - r.reservedUsd;
    const tokDiff = actualTokens - r.reservedTokens;

    if (usdDiff !== 0 || tokDiff !== 0) {
      const adj: Entry = { ts: now, usd: usdDiff, tokens: tokDiff };
      this.entries(this.minute, r.tenantId).push(adj);
      this.entries(this.day, r.tenantId).push(adj);
    }

    this.reservations.delete(reservationId);
    return r;
  }
}

export const ledger = new SpendLedger();
