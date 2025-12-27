// Heuristic. For hard-cap correctness we use it only as an upper bound.
// For truly strict environments, require callers to provide explicit token upper bounds.
export function roughTokenEstimateFromText(text: string): number {
  // ~4 chars/token is a common approximation; we round up.
  return Math.max(1, Math.ceil(text.length / 4));
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
