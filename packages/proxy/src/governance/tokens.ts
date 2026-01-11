type ChatMessage = { content?: unknown };

function readMessages(body: unknown): ChatMessage[] {
  if (!body || typeof body !== "object") return [];
  const msgs = (body as { messages?: unknown }).messages;
  return Array.isArray(msgs) ? (msgs as ChatMessage[]) : [];
}

export function estimatePromptTokens(body: unknown): number {
  const msgs = readMessages(body);
  let text = "";

  for (const m of msgs) {
    const c = m?.content;
    if (typeof c === "string") text += c + "\n";
    else if (c != null) text += JSON.stringify(c) + "\n";
  }

  return Math.max(1, Math.ceil(text.length / 4));
}

export function clampMaxTokens(requested: unknown, def: number, cap: number): number {
  const n = typeof requested === "number" ? requested : Number(requested);
  const v = Number.isFinite(n) ? Math.floor(n) : def;
  return Math.max(1, Math.min(cap, v));
}

export function outputTokensUpperBound(body: unknown, def = 512, cap = 32_768): number {
  if (!body || typeof body !== "object") return def;

  const b = body as {
    max_tokens?: unknown;
    max_completion_tokens?: unknown;
    max_output_tokens?: unknown;
  };

  const requested = b.max_tokens ?? b.max_completion_tokens ?? b.max_output_tokens;
  return clampMaxTokens(requested, def, cap);
}

export function totalTokensUpperBound(body: unknown): {
  promptUpper: number;
  completionUpper: number;
  totalUpper: number;
} {
  const promptUpper = estimatePromptTokens(body);
  const completionUpper = outputTokensUpperBound(body);
  return { promptUpper, completionUpper, totalUpper: promptUpper + completionUpper };
}
