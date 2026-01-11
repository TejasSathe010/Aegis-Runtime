import type { Provider, TenantPolicy } from "../env.js";

function matchModel(pattern: string, model: string): boolean {
  if (pattern.endsWith("*")) return model.startsWith(pattern.slice(0, -1));
  return pattern === model;
}

export function resolvePolicy(tenantId: string | undefined, policies: { default: TenantPolicy; tenants: Record<string, TenantPolicy> }): TenantPolicy {
  if (tenantId && policies.tenants[tenantId]) return policies.tenants[tenantId]!;
  return policies.default;
}

export function assertAllowed(policy: TenantPolicy, provider: Provider, model: string): string | null {
  if (policy.allowProviders && !policy.allowProviders.includes(provider)) {
    return `provider_not_allowed: ${provider}`;
  }
  if (policy.allowModels && policy.allowModels.length) {
    const ok = policy.allowModels.some((p) => matchModel(p, model));
    if (!ok) return `model_not_allowed: ${model}`;
  }
  return null;
}
