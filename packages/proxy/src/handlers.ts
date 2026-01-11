import type { ProxyEnv } from "./env.js";
import type { Provider, TenantPolicy } from "./env.js";
import { getUpstream, resolveProvider } from "./providers.js";
import { tapSseStream, type Usage } from "./sseTap.js";
import { totalTokensUpperBound, clampMaxTokens } from "./governance/tokens.js";
import { ledger } from "./governance/ledger.js";
import { assertAllowed, resolvePolicy } from "./governance/policy.js";
import { getPricing, tokensToUsd } from "./governance/pricing.js";
import { writeReceipt } from "./receipts/receipts.js";
import crypto from "node:crypto";

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

function budgetCheck(
  policy: TenantPolicy,
  current: { minute: { usd: number; tokens: number }; day: { usd: number; tokens: number } },
  reserveUsd: number | undefined,
  reserveTokens: number
): string | null {
  const perRunTok = policy.tokens?.perRun;
  if (typeof perRunTok === "number" && reserveTokens > perRunTok) return "tokens_per_run_exceeded";

  const perMinTok = policy.tokens?.perMinute;
  if (typeof perMinTok === "number" && current.minute.tokens + reserveTokens > perMinTok)
    return "tokens_per_minute_exceeded";

  const perDayTok = policy.tokens?.perDay;
  if (typeof perDayTok === "number" && current.day.tokens + reserveTokens > perDayTok)
    return "tokens_per_day_exceeded";

  if (typeof reserveUsd === "number") {
    const perRunUsd = policy.usd?.perRun;
    if (typeof perRunUsd === "number" && reserveUsd > perRunUsd) return "usd_per_run_exceeded";

    const perMinUsd = policy.usd?.perMinute;
    if (typeof perMinUsd === "number" && current.minute.usd + reserveUsd > perMinUsd)
      return "usd_per_minute_exceeded";

    const perDayUsd = policy.usd?.perDay;
    if (typeof perDayUsd === "number" && current.day.usd + reserveUsd > perDayUsd)
      return "usd_per_day_exceeded";
  }

  return null;
}

function normalizeMaxTokensInPlace(body: any, env: ProxyEnv) {
  const def = Number((env as any).defaultMaxTokens ?? (env as any).default_max_tokens ?? 128);
  const cap = Number((env as any).maxTokensCap ?? (env as any).max_tokens_cap ?? 2048);

  const requested =
    body?.max_tokens ??
    body?.max_completion_tokens ??
    body?.max_output_tokens;

  const normalized = clampMaxTokens(requested, def, cap);

  body.max_tokens = normalized;
}

export async function handleHealthz(): Promise<Response> {
  return new Response("ok", { status: 200 });
}

export async function handleChatCompletions(
  req: Request,
  env: ProxyEnv,
  signal: AbortSignal | null
): Promise<Response> {
  const tsMs = Date.now();

  let tenantId: string | undefined;
  let runId: string | undefined;

  if (env.requireTenantHeader) {
    tenantId = requireHeader(req, "x-tenant-id");
    runId = requireHeader(req, "x-run-id");
  } else {
    tenantId = req.headers.get("x-tenant-id") ?? undefined;
    runId = req.headers.get("x-run-id") ?? undefined;
  }

  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  const body = await readJson(req);

  normalizeMaxTokensInPlace(body, env);

  const stream = Boolean(body?.stream);
  const provider = resolveProvider(body, req.headers.get("x-aegis-provider"), env);
  const model = typeof body?.model === "string" ? body.model : "unknown";

  if (stream && env.streamIncludeUsage) {
    const so = body.stream_options ?? {};
    if (so.include_usage !== true) body.stream_options = { ...so, include_usage: true };
  }

  const policy = resolvePolicy(tenantId, env.policies);

  const allowErr = assertAllowed(policy, provider, model);
  if (allowErr && env.governanceEnabled && policy.hardStop) {
    const durationMs = Date.now() - tsMs;

    await writeReceipt(env, {
      tsMs,
      durationMs,
      ...(tenantId ? { tenantId } : {}),
      ...(runId ? { runId } : {}),
      requestId,
      provider,
      model,
      stream,
      decision: "block",
      status: 402,
      ok: false,
      promptTokensUpper: 0,
      completionTokensUpper: 0,
      totalTokensUpper: 0,
      reservedTokens: 0,
      policySnapshot: policy,
      errorMessage: allowErr
    });

    return new Response(
      JSON.stringify({ error: { message: allowErr, code: "not_allowed", provider, status: 402 } }),
      {
        status: 402,
        headers: { "content-type": "application/json", "x-aegis-provider": provider }
      }
    );
  }

  const { promptUpper, completionUpper, totalUpper } = totalTokensUpperBound(body);

  const pricing = getPricing(env, provider, model);
  const reservedUsd = pricing ? tokensToUsd(pricing, promptUpper, completionUpper) : undefined;

  if (env.governanceEnabled) {
    const tid = tenantId ?? "tenant_unknown";
    const current = ledger.current(tid, tsMs);
    const reason = budgetCheck(policy, current, reservedUsd, totalUpper);

    if (reason && policy.hardStop) {
      const durationMs = Date.now() - tsMs;

      await writeReceipt(env, {
        tsMs,
        durationMs,
        ...(tenantId ? { tenantId } : {}),
        ...(runId ? { runId } : {}),
        requestId,
        provider,
        model,
        stream,
        decision: "block",
        status: 402,
        ok: false,
        promptTokensUpper: promptUpper,
        completionTokensUpper: completionUpper,
        totalTokensUpper: totalUpper,
        reservedTokens: totalUpper,
        ...(typeof reservedUsd === "number" ? { reservedUsd } : {}),
        policySnapshot: policy,
        ...(pricing ? { pricingUsed: pricing } : {}),
        errorMessage: reason
      });

      return new Response(
        JSON.stringify({
          error: { message: `Budget exceeded: ${reason}`, code: "budget_exceeded", provider, status: 402 }
        }),
        {
          status: 402,
          headers: { "content-type": "application/json", "x-aegis-provider": provider }
        }
      );
    }

    ledger.reserve(requestId, tid, typeof reservedUsd === "number" ? reservedUsd : 0, totalUpper, tsMs);
  }

  let upstreamResp = await doUpstreamFetch(provider, env, body, signal);

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

  if (!upstreamResp.ok) {
    const txt = firstErrorText ?? (await upstreamResp.text());
    const normalized = normalizeError(provider, upstreamResp.status, txt);

    if (env.governanceEnabled) {
      ledger.release(requestId, Date.now());
    }

    const durationMs = Date.now() - tsMs;
    await writeReceipt(env, {
      tsMs,
      durationMs,
      ...(tenantId ? { tenantId } : {}),
      ...(runId ? { runId } : {}),
      requestId,
      provider,
      model,
      stream,
      decision: "allow",
      status: upstreamResp.status,
      ok: false,
      promptTokensUpper: promptUpper,
      completionTokensUpper: completionUpper,
      totalTokensUpper: totalUpper,
      reservedTokens: totalUpper,
      ...(typeof reservedUsd === "number" ? { reservedUsd } : {}),
      policySnapshot: policy,
      ...(pricing ? { pricingUsed: pricing } : {}),
      errorMessage: normalized?.error?.message ? String(normalized.error.message) : "upstream_error"
    });

    return new Response(JSON.stringify(normalized), {
      status: upstreamResp.status,
      headers: { "content-type": "application/json", "x-aegis-provider": provider }
    });
  }

  if (!stream) {
    const text = await upstreamResp.text();
    const usage = extractUsageFromJson(text);

    const actualPrompt = usage?.prompt_tokens ?? promptUpper;
    const actualCompletion = usage?.completion_tokens ?? 0;
    const actualUsd = pricing ? tokensToUsd(pricing, actualPrompt, actualCompletion) : undefined;

    if (env.governanceEnabled) {
      const tid = tenantId ?? "tenant_unknown";
      ledger.reconcile(
        requestId,
        typeof actualUsd === "number" ? actualUsd : 0,
        usage?.total_tokens ?? totalUpper,
        Date.now()
      );
    }

    const durationMs = Date.now() - tsMs;
    await writeReceipt(env, {
      tsMs,
      durationMs,
      ...(tenantId ? { tenantId } : {}),
      ...(runId ? { runId } : {}),
      requestId,
      provider,
      model,
      stream: false,
      decision: "allow",
      status: upstreamResp.status,
      ok: true,
      promptTokensUpper: promptUpper,
      completionTokensUpper: completionUpper,
      totalTokensUpper: totalUpper,
      reservedTokens: totalUpper,
      ...(typeof reservedUsd === "number" ? { reservedUsd } : {}),
      ...(usage ? { usage } : {}),
      ...(typeof actualUsd === "number" ? { actualUsd } : {}),
      policySnapshot: policy,
      ...(pricing ? { pricingUsed: pricing } : {})
    });

    const headers = copySelectedHeaders(upstreamResp);
    headers.set("x-aegis-provider", provider);
    headers.set("content-type", "application/json");
    return new Response(text, { status: upstreamResp.status, headers });
  }

  if (!upstreamResp.body) {
    if (env.governanceEnabled) ledger.release(requestId, Date.now());

    const durationMs = Date.now() - tsMs;
    await writeReceipt(env, {
      tsMs,
      durationMs,
      ...(tenantId ? { tenantId } : {}),
      ...(runId ? { runId } : {}),
      requestId,
      provider,
      model,
      stream: true,
      decision: "allow",
      status: 200,
      ok: true,
      promptTokensUpper: promptUpper,
      completionTokensUpper: completionUpper,
      totalTokensUpper: totalUpper,
      reservedTokens: totalUpper,
      ...(typeof reservedUsd === "number" ? { reservedUsd } : {}),
      policySnapshot: policy,
      ...(pricing ? { pricingUsed: pricing } : {})
    });

    return new Response(null, { status: 200, headers: { "x-aegis-provider": provider } });
  }

  const { stream: outStream, done } = tapSseStream(upstreamResp.body);

  void done
    .then(async ({ usage }) => {
      const now = Date.now();
      const u = usage;

      const actualPrompt = u?.prompt_tokens ?? promptUpper;
      const actualCompletion = u?.completion_tokens ?? 0;
      const actualUsd = pricing ? tokensToUsd(pricing, actualPrompt, actualCompletion) : undefined;
      const actualTotalTokens = u?.total_tokens ?? totalUpper;

      if (env.governanceEnabled) {
        const tid = tenantId ?? "tenant_unknown";
        ledger.reconcile(requestId, typeof actualUsd === "number" ? actualUsd : 0, actualTotalTokens, now);
      }

      const durationMs = now - tsMs;
      await writeReceipt(env, {
        tsMs,
        durationMs,
        ...(tenantId ? { tenantId } : {}),
        ...(runId ? { runId } : {}),
        requestId,
        provider,
        model,
        stream: true,
        decision: "allow",
        status: upstreamResp.status,
        ok: true,
        promptTokensUpper: promptUpper,
        completionTokensUpper: completionUpper,
        totalTokensUpper: totalUpper,
        reservedTokens: totalUpper,
        ...(typeof reservedUsd === "number" ? { reservedUsd } : {}),
        ...(u ? { usage: u } : {}),
        ...(typeof actualUsd === "number" ? { actualUsd } : {}),
        policySnapshot: policy,
        ...(pricing ? { pricingUsed: pricing } : {})
      });
    })
    .catch(() => {
      if (env.governanceEnabled) ledger.release(requestId, Date.now());
    });

  const headers = copySelectedHeaders(upstreamResp);
  headers.set("x-aegis-provider", provider);
  if (!headers.get("content-type")) headers.set("content-type", "text/event-stream");

  return new Response(outStream, { status: upstreamResp.status, headers });
}
