import type { ProxyEnv } from "./env.js";
import type { Provider } from "./env.js";
import { getUpstream, resolveProvider } from "./providers.js";

function requireHeader(req: Request, name: string) {
  const v = req.headers.get(name);
  if (!v) throw Object.assign(new Error(`Missing header: ${name}`), { status: 400 });
  return v;
}

async function readJson(req: Request, maxBytes = 2_000_000): Promise<any> {
  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) throw Object.assign(new Error("Payload too large"), { status: 413 });
  const txt = new TextDecoder().decode(buf);
  try {
    return txt ? JSON.parse(txt) : {};
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

function copySelectedHeaders(upstreamResp: Response): Headers {
  const h = new Headers();
  const ct = upstreamResp.headers.get("content-type");
  if (ct) h.set("content-type", ct);
  for (const k of ["x-request-id", "openai-request-id"]) {
    const v = upstreamResp.headers.get(k);
    if (v) h.set(k, v);
  }
  return h;
}

function normalizeError(provider: Provider, status: number, rawText: string): any {
  // Try JSON parse
  try {
    const parsed = JSON.parse(rawText);

    // Gemini sometimes returns [ { error: {...} } ]
    if (Array.isArray(parsed) && parsed[0]?.error) {
      return { error: { ...parsed[0].error, provider, status } };
    }

    // Already OpenAI-style { error: {...} }
    if (parsed?.error) {
      return { error: { ...parsed.error, provider, status } };
    }

    // Some providers return { message, ... }
    if (parsed?.message) {
      return { error: { message: String(parsed.message), provider, status } };
    }

    // Fallback
    return { error: { message: rawText || `Upstream error (${status})`, provider, status } };
  } catch {
    return { error: { message: rawText || `Upstream error (${status})`, provider, status } };
  }
}

function isGeminiQuota429(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("resource_exhausted") ||
    t.includes("quota exceeded") ||
    t.includes("rate limit") ||
    t.includes("generativelanguage.googleapis.com/generate_content")
  );
}

async function doUpstreamFetch(
  provider: Provider,
  env: ProxyEnv,
  body: any,
  signal: AbortSignal | null
): Promise<Response> {
  const upstream = getUpstream(env, provider);
  return fetch(upstream.url, {
    method: "POST",
    headers: { "content-type": "application/json", ...upstream.headers },
    body: JSON.stringify(body),
    signal
  });
}

export async function handleHealthz(): Promise<Response> {
  return new Response("ok", { status: 200 });
}

export async function handleChatCompletions(req: Request, env: ProxyEnv, signal: AbortSignal | null): Promise<Response> {
  if (env.requireTenantHeader) {
    requireHeader(req, "x-tenant-id");
    requireHeader(req, "x-run-id");
  }

  const body = await readJson(req);
  const stream = Boolean(body?.stream);

  const provider = resolveProvider(body, req.headers.get("x-aegis-provider"), env);

  // First attempt
  let upstreamResp = await doUpstreamFetch(provider, env, body, signal);

  // Optional Gemini fallback: only for non-streaming to keep behavior predictable
  let firstErrorText: string | null = null;
  if (
    provider === "gemini" &&
    !stream &&
    env.geminiAllowFallback &&
    upstreamResp.status === 429 &&
    typeof env.geminiFallbackModel === "string" &&
    env.geminiFallbackModel.length > 0 &&
    body?.model &&
    body.model !== env.geminiFallbackModel
  ) {
    firstErrorText = await upstreamResp.text();

    if (isGeminiQuota429(firstErrorText)) {
      const retryBody = { ...body, model: env.geminiFallbackModel };
      upstreamResp = await doUpstreamFetch(provider, env, retryBody, signal);
    }
  }

  // Normalize non-2xx errors (don’t stream error bodies)
  if (!upstreamResp.ok) {
    const txt = firstErrorText ?? (await upstreamResp.text());
    const normalized = normalizeError(provider, upstreamResp.status, txt);
    return new Response(JSON.stringify(normalized), {
      status: upstreamResp.status,
      headers: {
        "content-type": "application/json",
        "x-aegis-provider": provider
      }
    });
  }

  // Pass-through success (streaming or JSON)
  const headers = copySelectedHeaders(upstreamResp);
  headers.set("x-aegis-provider", provider);

  return new Response(upstreamResp.body, { status: upstreamResp.status, headers });
}
