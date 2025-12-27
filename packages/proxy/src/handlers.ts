import type { ProxyEnv } from "./env.js";
import type { Provider } from "./env.js";
import { getUpstream, resolveProvider } from "./providers.js";
import { tapSseStream, type Usage } from "./sseTap.js";
import { writeAudit } from "./audit.js";

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

  const cc = upstreamResp.headers.get("cache-control");
  if (cc) h.set("cache-control", cc);

  return h;
}

function normalizeError(provider: Provider, status: number, rawText: string): any {
  try {
    const parsed = JSON.parse(rawText);

    if (Array.isArray(parsed) && parsed[0]?.error) {
      return { error: { ...parsed[0].error, provider, status } };
    }

    if (parsed?.error) {
      return { error: { ...parsed.error, provider, status } };
    }

    if (parsed?.message) {
      return { error: { message: String(parsed.message), provider, status } };
    }

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

  const accept = body?.stream ? "text/event-stream" : "application/json";

  return fetch(upstream.url, {
    method: "POST",
    headers: { "content-type": "application/json", accept, ...upstream.headers },
    body: JSON.stringify(body),
    signal
  });
}

function extractUsageFromJson(text: string): Usage | undefined {
  try {
    const obj = JSON.parse(text);
    const u = obj?.usage;
    if (!u || typeof u !== "object") return undefined;

    const usage: Usage = {
      prompt_tokens: typeof u.prompt_tokens === "number" ? u.prompt_tokens : undefined,
      completion_tokens: typeof u.completion_tokens === "number" ? u.completion_tokens : undefined,
      total_tokens: typeof u.total_tokens === "number" ? u.total_tokens : undefined
    };

    if (usage.prompt_tokens || usage.completion_tokens || usage.total_tokens) return usage;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function handleHealthz(): Promise<Response> {
  return new Response("ok", { status: 200 });
}

export async function handleChatCompletions(req: Request, env: ProxyEnv, signal: AbortSignal | null): Promise<Response> {
  const started = Date.now();

  let tenantId: string | undefined;
  let runId: string | undefined;

  if (env.requireTenantHeader) {
    tenantId = requireHeader(req, "x-tenant-id");
    runId = requireHeader(req, "x-run-id");
  } else {
    tenantId = req.headers.get("x-tenant-id") ?? undefined;
    runId = req.headers.get("x-run-id") ?? undefined;
  }

  const body = await readJson(req);
  const stream = Boolean(body?.stream);

  const provider = resolveProvider(body, req.headers.get("x-aegis-provider"), env);

  // M3: request usage in final stream chunk (OpenAI needs this)
  if (stream && env.streamIncludeUsage) {
    const so = body.stream_options ?? {};
    if (so.include_usage !== true) {
      body.stream_options = { ...so, include_usage: true };
    }
  }

  const model = typeof body?.model === "string" ? body.model : undefined;

  // First attempt
  let upstreamResp = await doUpstreamFetch(provider, env, body, signal);

  // Optional Gemini fallback: only for non-streaming
  let firstErrorText: string | null = null;
  if (
    provider === "gemini" &&
    !stream &&
    env.geminiAllowFallback &&
    upstreamResp.status === 429 &&
    typeof env.geminiFallbackModel === "string" &&
    env.geminiFallbackModel.length > 0 &&
    model &&
    model !== env.geminiFallbackModel
  ) {
    firstErrorText = await upstreamResp.text();
    if (isGeminiQuota429(firstErrorText)) {
      const retryBody = { ...body, model: env.geminiFallbackModel };
      upstreamResp = await doUpstreamFetch(provider, env, retryBody, signal);
    }
  }

  // Errors: normalize + audit
  if (!upstreamResp.ok) {
    const txt = firstErrorText ?? (await upstreamResp.text());
    const normalized = normalizeError(provider, upstreamResp.status, txt);

    const duration = Date.now() - started;
    void writeAudit(env, {
      ts_ms: started,
      duration_ms: duration,
      provider,
      stream,
      status: upstreamResp.status,
      ...(tenantId ? { tenant_id: tenantId } : {}),
      ...(runId ? { run_id: runId } : {}),
      ...(model ? { model } : {}),
      ...(normalized?.error?.message ? { error_message: String(normalized.error.message) } : {})
    }).catch(() => {});

    return new Response(JSON.stringify(normalized), {
      status: upstreamResp.status,
      headers: {
        "content-type": "application/json",
        "x-aegis-provider": provider
      }
    });
  }

  // Success: non-stream -> buffer once (so we can reliably audit usage)
  if (!stream) {
    const text = await upstreamResp.text();
    const usage = extractUsageFromJson(text);
    const duration = Date.now() - started;

    void writeAudit(env, {
      ts_ms: started,
      duration_ms: duration,
      provider,
      stream: false,
      status: upstreamResp.status,
      ...(tenantId ? { tenant_id: tenantId } : {}),
      ...(runId ? { run_id: runId } : {}),
      ...(model ? { model } : {}),
      ...(usage ? { usage } : {})
    }).catch(() => {});

    const headers = copySelectedHeaders(upstreamResp);
    headers.set("x-aegis-provider", provider);
    headers.set("content-type", "application/json");

    return new Response(text, { status: upstreamResp.status, headers });
  }

  // Success: stream -> strict passthrough with tap
  if (!upstreamResp.body) {
    const duration = Date.now() - started;
    void writeAudit(env, {
      ts_ms: started,
      duration_ms: duration,
      provider,
      stream: true,
      status: upstreamResp.status,
      ...(tenantId ? { tenant_id: tenantId } : {}),
      ...(runId ? { run_id: runId } : {}),
      ...(model ? { model } : {})
    }).catch(() => {});

    return new Response(null, { status: 200, headers: { "x-aegis-provider": provider } });
  }

  const { stream: outStream, done } = tapSseStream(upstreamResp.body);

  // Defer audit until stream completes
  void done
    .then(async ({ usage }) => {
      const duration = Date.now() - started;
      await writeAudit(env, {
        ts_ms: started,
        duration_ms: duration,
        provider,
        stream: true,
        status: upstreamResp.status,
        ...(tenantId ? { tenant_id: tenantId } : {}),
        ...(runId ? { run_id: runId } : {}),
        ...(model ? { model } : {}),
        ...(usage ? { usage } : {})
      });
    })
    .catch(() => {});

  const headers = copySelectedHeaders(upstreamResp);
  headers.set("x-aegis-provider", provider);

  if (!headers.get("content-type")) headers.set("content-type", "text/event-stream");

  return new Response(outStream, { status: upstreamResp.status, headers });
}
