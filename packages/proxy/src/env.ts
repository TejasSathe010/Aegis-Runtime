export type Provider = "openai" | "gemini";

export interface ProxyEnv {
  port: number;

  defaultProvider: Provider;
  requireTenantHeader: boolean;

  openai: {
    apiKey?: string; // omit when missing
    baseUrl: string;
  };

  gemini: {
    apiKey?: string; // omit when missing
    baseUrl: string; // https://generativelanguage.googleapis.com/v1beta/openai
  };

  // Fallback behavior (Gemini-only)
  geminiAllowFallback: boolean;
  geminiFallbackModel: string | undefined;

  // M3: Streaming correctness + reconciliation
  streamIncludeUsage: boolean; // if stream==true, request usage in final chunk (OpenAI needs this) :contentReference[oaicite:2]{index=2}
  auditEnabled: boolean;

  // keep for later milestones (signing)
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

export function loadEnv(processEnv = process.env): ProxyEnv {
  const defaultProvider = (processEnv.AEGIS_DEFAULT_PROVIDER ?? "gemini") as Provider;

  const openaiApiKey = optionalString(processEnv.OPENAI_API_KEY);
  const geminiApiKey = optionalString(processEnv.GEMINI_API_KEY);

  const geminiFallbackModel =
    optionalString(processEnv.AEGIS_GEMINI_FALLBACK_MODEL) ?? "gemini-2.5-flash";

  return {
    port: mustInt("PORT", processEnv.PORT, 8787),
    defaultProvider,
    requireTenantHeader: envBool(processEnv.AEGIS_REQUIRE_TENANT_HEADER, true),

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

    // M3 toggles
    streamIncludeUsage: envBool(processEnv.AEGIS_STREAM_INCLUDE_USAGE, true),
    auditEnabled: envBool(processEnv.AEGIS_AUDIT_ENABLED, true),

    auditDir: String(processEnv.AEGIS_AUDIT_DIR ?? ".aegis/receipts"),
    signerKeyId: String(processEnv.AEGIS_SIGNER_KEY_ID ?? "local-k1"),
    signerSecretHex: String(processEnv.AEGIS_SIGNER_SECRET_HEX ?? "01020304")
  };
}
