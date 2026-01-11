export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export async function tapSseForUsage(stream: ReadableStream<Uint8Array>): Promise<OpenAIUsage | undefined> {
  const dec = new TextDecoder();
  let buf = "";
  let usage: OpenAIUsage | undefined;

  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);

      for (const line of chunk.split("\n")) {
        const m = line.match(/^data:\s*(.*)\s*$/);
        if (!m) continue;
        const payload = m[1];
        if (!payload || payload === "[DONE]") continue;

        try {
          const obj = JSON.parse(payload) as any;
          if (obj && obj.usage && typeof obj.usage.prompt_tokens === "number") {
            usage = obj.usage as OpenAIUsage;
          }
        } catch {
        }
      }
    }
  }
  return usage;
}
