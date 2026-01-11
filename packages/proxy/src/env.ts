export type Provider = "openai" | "gemini";

export type Pricing = {
  inputUsdPer1kTokens: number;
  outputUsdPer1kTokens: number;
};

export type PricingTable = Record<string, Record<string, Pricing>>;

export type TenantPolicy = {
  hardStop: boolean;

  tokens: {
    perRun: number;
    perMinute: number;
    perDay: number;
  };

  usd?: {
    perRun?: number;
    perMinute?: number;
    perDay?: number;
  };

  allowProviders?: Provider[];
  allowModels?: string[];
};

export type Policies = {
  default: TenantPolicy;
  tenants: Record<string, TenantPolicy>;
};

export interface ProxyEnv {
  port: number;

  defaultProvider: Provider;
  requireTenantHeader: boolean;
  streamIncludeUsage: boolean;

  openai: {
    apiKey?: string;
    baseUrl: string;
  };

  gemini: {
    apiKey?: string;
    baseUrl: string;
  };

  geminiAllowFallback: boolean;
  geminiFallbackModel: string;

  governanceEnabled: boolean;
  policies: Policies;

  defaultMaxTokens: number;
  maxTokensCap: number;

  pricing: PricingTable;

  receiptsDir: string;

  auditDir: string;

  signerKeyId: string;
  signerSecretHex: string;
}

function mustInt(name: string, v: string | undefined, def: number) {
  const n = v ? Number(v) : def;
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}`);
  return n;
}

function normBaseUrl(u: string) {
  return u.replace(/\/+$/, "");
}

function optionalString(v: unknown): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

function envBool(v: unknown, def: boolean) {
  if (typeof v !== "string") return def;
  const s = v.trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return def;
}

function parseJson<T>(name: string, v: string | undefined): T | undefined {
  if (!v) return undefined;
  try {
    return JSON.parse(v) as T;
  } catch {
    throw new Error(`Invalid JSON in ${name}`);
  }
}

const DEFAULT_POLICY: TenantPolicy = {
  hardStop: true,
  tokens: { perRun: 5000, perMinute: 50_000, perDay: 500_000 }
};

export function loadEnv(processEnv = process.env): ProxyEnv {
  const defaultProvider = (processEnv.AEGIS_DEFAULT_PROVIDER ?? "gemini") as Provider;

  const openaiApiKey = optionalString(processEnv.OPENAI_API_KEY);
  const geminiApiKey = optionalString(processEnv.GEMINI_API_KEY);

  const defaultPolicyOverride = parseJson<TenantPolicy>(
    "AEGIS_DEFAULT_POLICY_JSON",
    processEnv.AEGIS_DEFAULT_POLICY_JSON
  );

  const tenantPolicies =
    parseJson<Record<string, TenantPolicy>>("AEGIS_TENANT_POLICIES_JSON", processEnv.AEGIS_TENANT_POLICIES_JSON) ??
    {};

  const pricing =
    parseJson<PricingTable>("AEGIS_PRICING_JSON", processEnv.AEGIS_PRICING_JSON) ?? ({} as PricingTable);

  const receiptsDir =
    processEnv.AEGIS_RECEIPTS_DIR ??
    processEnv.AEGIS_AUDIT_DIR ?? // backward compat
    ".aegis/receipts";

  const geminiFallbackModel = optionalString(processEnv.AEGIS_GEMINI_FALLBACK_MODEL) ?? "gemini-2.5-flash";

  return {
    port: mustInt("PORT", processEnv.PORT, 8787),

    defaultProvider,
    requireTenantHeader: envBool(processEnv.AEGIS_REQUIRE_TENANT_HEADER, true),
    streamIncludeUsage: envBool(processEnv.AEGIS_STREAM_INCLUDE_USAGE, true),

    openai: {
      ...(openaiApiKey ? { apiKey: openaiApiKey } : {}),
      baseUrl: normBaseUrl(processEnv.OPENAI_BASE_URL ?? "https://api.openai.com/v1")
    },

    gemini: {
      ...(geminiApiKey ? { apiKey: geminiApiKey } : {}),
      baseUrl: normBaseUrl(
        processEnv.GEMINI_OPENAI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai"
      )
    },

    geminiAllowFallback: envBool(processEnv.AEGIS_GEMINI_ALLOW_FALLBACK, true),
    geminiFallbackModel,

    governanceEnabled: envBool(processEnv.AEGIS_GOVERNANCE_ENABLED, true),
    policies: {
      default: defaultPolicyOverride ?? DEFAULT_POLICY,
      tenants: tenantPolicies
    },

    defaultMaxTokens: mustInt("AEGIS_DEFAULT_MAX_TOKENS", processEnv.AEGIS_DEFAULT_MAX_TOKENS, 128),
    maxTokensCap: mustInt("AEGIS_MAX_TOKENS_CAP", processEnv.AEGIS_MAX_TOKENS_CAP, 2048),

    pricing,

    receiptsDir,
    auditDir: receiptsDir,

    signerKeyId: String(processEnv.AEGIS_SIGNER_KEY_ID ?? "local-k1"),
    signerSecretHex: String(processEnv.AEGIS_SIGNER_SECRET_HEX ?? "01020304")
  };
}
