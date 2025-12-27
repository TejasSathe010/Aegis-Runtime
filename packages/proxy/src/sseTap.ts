export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type StreamTapResult = {
  stream: ReadableStream<Uint8Array>;
  done: Promise<{ sawDone: boolean; usage?: Usage }>;
};

export function tapSseStream(input: ReadableStream<Uint8Array>): StreamTapResult {
  const decoder = new TextDecoder();
  let buffer = "";
  let sawDone = false;
  let usage: Usage | undefined;

  let resolveDone!: (v: { sawDone: boolean; usage?: Usage }) => void;
  const done = new Promise<{ sawDone: boolean; usage?: Usage }>((r) => (resolveDone = r));

  function tryExtractUsage(obj: any) {
    const u = obj?.usage;
    if (!u) return;
    if (typeof u !== "object") return;

    const next: Usage = {
      prompt_tokens: typeof u.prompt_tokens === "number" ? u.prompt_tokens : undefined,
      completion_tokens: typeof u.completion_tokens === "number" ? u.completion_tokens : undefined,
      total_tokens: typeof u.total_tokens === "number" ? u.total_tokens : undefined
    };

    // Store if it looks meaningful
    if (next.prompt_tokens || next.completion_tokens || next.total_tokens) usage = next;
  }

  function processSseText(text: string) {
    // Normalize for parsing only; we do NOT re-emit this text.
    buffer += text.replace(/\r\n/g, "\n");

    while (true) {
      const sep = buffer.indexOf("\n\n");
      if (sep === -1) break;

      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      // Collect data lines
      const lines = event.split("\n");
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
      }
      if (!dataLines.length) continue;

      const payload = dataLines.join("\n").trim();
      if (!payload) continue;
      if (payload === "[DONE]") {
        sawDone = true;
        continue;
      }

      try {
        const obj = JSON.parse(payload);
        tryExtractUsage(obj);
      } catch {
        // ignore malformed chunk; passthrough is still correct
      }
    }
  }

  const ts = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk); // strict passthrough
      processSseText(decoder.decode(chunk, { stream: true }));
    },
    flush() {
      processSseText(decoder.decode(new Uint8Array(), { stream: false }));
      resolveDone({
        sawDone,
        ...(usage ? { usage } : {})
      });
    }
  });

  return { stream: input.pipeThrough(ts), done };
}
