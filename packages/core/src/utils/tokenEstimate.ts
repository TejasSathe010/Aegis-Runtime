export function roughTokenEstimateFromText(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
