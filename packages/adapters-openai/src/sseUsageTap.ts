export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Reads an SSE stream copy and tries to detect the final usage block.
// Works when request includes: stream_options: { include_usage: true }
export async function tapSseForUsage(stream: ReadableStream<Uint8Array>): Promise<OpenAIUsage | undefined> {
  const dec = new TextDecoder();
  let buf = "";
  let usage: OpenAIUsage | undefined;

  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    // Parse by SSE event delimiter.
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);

      // Each SSE message can have multiple lines; we care about "data:"
      for (const line of chunk.split("\n")) {
        const m = line.match(/^data:\s*(.*)\s*$/);
        if (!m) continue;
        const payload = m[1];
        if (!payload || payload === "[DONE]") continue;

        try {
          const obj = JSON.parse(payload) as any;
          // Chat Completions streaming may include usage in a final chunk:
          // { ... , usage: { prompt_tokens, completion_tokens, total_tokens } }
          if (obj && obj.usage && typeof obj.usage.prompt_tokens === "number") {
            usage = obj.usage as OpenAIUsage;
          }
        } catch {
          // ignore
        }
      }
    }
  }
  return usage;
}
