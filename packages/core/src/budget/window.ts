import type { BudgetWindow } from "../policy.js";

export function windowStartMs(nowMs: number, w: BudgetWindow): number {
  const d = new Date(nowMs);
  if (w === "minute") {
    d.setSeconds(0, 0);
    return d.getTime();
  }
  if (w === "hour") {
    d.setMinutes(0, 0, 0);
    return d.getTime();
  }
  if (w === "day") {
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  // month
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
