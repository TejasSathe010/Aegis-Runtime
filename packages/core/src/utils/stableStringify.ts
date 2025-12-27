type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype;
}

export function stableStringify(value: unknown): string {
  const norm = normalize(value);
  return JSON.stringify(norm);
}

function normalize(value: unknown): Json {
  if (value === null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) return value.map(normalize);

  if (isPlainObject(value)) {
    const out: Record<string, Json> = {};
    const keys = Object.keys(value).sort();
    for (const k of keys) out[k] = normalize((value as Record<string, unknown>)[k]);
    return out;
  }

  // For non-JSON types, we intentionally coerce to string for audit stability.
  return String(value);
}
