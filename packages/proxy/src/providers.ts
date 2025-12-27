import type { Provider, ProxyEnv } from "./env.js";

export type Upstream = {
  provider: Provider;
  url: string;
  headers: Record<string, string>;
};

export function resolveProvider(reqBody: any, headerProvider: string | null, env: ProxyEnv): Provider {
  const hp = (headerProvider ?? "").trim().toLowerCase();
  if (hp === "openai" || hp === "gemini") return hp;

  const model = typeof reqBody?.model === "string" ? reqBody.model : "";
  if (model.startsWith("gemini-")) return "gemini";

  return env.defaultProvider;
}

export function getUpstream(env: ProxyEnv, provider: Provider): Upstream {
  if (provider === "openai") {
    if (!env.openai.apiKey) throw new Error("Missing OPENAI_API_KEY (required when provider=openai)");
    return {
      provider,
      url: `${env.openai.baseUrl}/chat/completions`,
      headers: { Authorization: `Bearer ${env.openai.apiKey}` }
    };
  }

  if (!env.gemini.apiKey) throw new Error("Missing GEMINI_API_KEY (required when provider=gemini)");
  return {
    provider,
    url: `${env.gemini.baseUrl}/chat/completions`,
    headers: { Authorization: `Bearer ${env.gemini.apiKey}` }
  };
}
