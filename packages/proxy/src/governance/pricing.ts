import type { Pricing, Provider, ProxyEnv } from "../env.js";

export function getPricing(env: ProxyEnv, provider: Provider, model: string): Pricing | undefined {
  const table = env.pricing;
  if (!table) return undefined;

  const byProvider = table[provider];
  if (!byProvider) return undefined;

  const exact = byProvider[model];
  if (exact) return exact;

  for (const [k, v] of Object.entries(byProvider)) {
    if (k.endsWith("*")) {
      const prefix = k.slice(0, -1);
      if (model.startsWith(prefix)) return v;
    }
  }

  return byProvider["default"];
}

export function tokensToUsd(p: Pricing, promptTokens: number, completionTokens: number): number {
  const inUsd = (promptTokens / 1000) * p.inputUsdPer1kTokens;
  const outUsd = (completionTokens / 1000) * p.outputUsdPer1kTokens;
  return inUsd + outUsd;
}
