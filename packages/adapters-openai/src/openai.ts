import type { Gate } from "@aegis/core";
import { roughTokenEstimateFromText, clampInt } from "@aegis/core";
import { tapSseForUsage } from "./sseUsageTap.js";

export type OpenAIChatMessage = { role: "system" | "user" | "assistant" | "tool"; content: string };

export interface OpenAIChatCompletionsRequest {
  model: string;
  messages: OpenAIChatMessage[];
  max_tokens?: number;
  stream?: boolean;
  stream_options?: { include_usage?: boolean };
  temperature?: number;
}

export interface OpenAIEnv {
  apiKey: string;
  baseUrl?: string;
}

function jsonHeaders(apiKey: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "authorization": `Bearer ${apiKey}`
  };
}

export async function openaiChatCompletionsViaGate(args: {
  gate: Gate;
  tenantId: string;
  runId: string;
  requestId: string;
  env: OpenAIEnv;
  body: OpenAIChatCompletionsRequest;
}): Promise<Response> {
  const baseUrl = args.env.baseUrl ?? "https://api.openai.com";
  const url = `${baseUrl}/v1/chat/completions`;

  const stream = Boolean(args.body.stream);
  const maxOut = clampInt(args.body.max_tokens ?? 512, 1, 8192);

  const inputText = args.body.messages.map(m => m.content).join("\n");
  const inputUpper = roughTokenEstimateFromText(inputText);
  const outputUpper = maxOut;

  const body: OpenAIChatCompletionsRequest = stream
    ? { ...args.body, stream_options: { ...(args.body.stream_options ?? {}), include_usage: true } }
    : args.body;

  const res = await args.gate.call({
    tenantId: args.tenantId,
    runId: args.runId,
    requestId: args.requestId,

    provider: "openai",
    model: args.body.model,
    operation: "chat.completions",

    stream,

    inputTokensUpperBound: inputUpper,
    outputTokensUpperBound: outputUpper,

    execute: async () => {
      const upstream = await fetch(url, {
        method: "POST",
        headers: jsonHeaders(args.env.apiKey),
        body: JSON.stringify(body)
      });

      const providerRequestId = upstream.headers.get("x-request-id") ?? null;

      if (!stream) {
        const txt = await upstream.text();
        let usage: { inputTokens: number; outputTokens: number } | undefined;
        try {
          const obj = JSON.parse(txt) as any;
          if (obj?.usage?.prompt_tokens != null && obj?.usage?.completion_tokens != null) {
            usage = { inputTokens: obj.usage.prompt_tokens, outputTokens: obj.usage.completion_tokens };
          }
        } catch {
        }

        return {
          ok: upstream.ok,
          status: upstream.status,
          ...(providerRequestId ? { providerRequestId } : {}),
          ...(usage ? { usage } : {})
        };
      }

      return {
        ok: upstream.ok,
        status: upstream.status,
        ...(providerRequestId ? { providerRequestId } : {})
      };
    }
  });

  return new Response(JSON.stringify(res), { status: 200, headers: { "content-type": "application/json" } });
}

export async function forwardOpenAIChatCompletions(args: {
  env: OpenAIEnv;
  body: OpenAIChatCompletionsRequest;
}): Promise<{ upstream: Response; usagePromise?: Promise<{ inputTokens: number; outputTokens: number } | undefined> }> {
  const baseUrl = args.env.baseUrl ?? "https://api.openai.com";
  const url = `${baseUrl}/v1/chat/completions`;

  const stream = Boolean(args.body.stream);
  const body: OpenAIChatCompletionsRequest = stream
    ? { ...args.body, stream_options: { ...(args.body.stream_options ?? {}), include_usage: true } }
    : args.body;

  const upstream = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(args.env.apiKey),
    body: JSON.stringify(body)
  });

  if (!stream || !upstream.body) return { upstream };

  const [toClient, toTap] = upstream.body.tee();
  const usagePromise = tapSseForUsage(toTap).then(u => {
    if (!u) return undefined;
    return { inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens };
  });

  const cloned = new Response(toClient, {
    status: upstream.status,
    headers: upstream.headers
  });

  return { upstream: cloned, usagePromise };
}
