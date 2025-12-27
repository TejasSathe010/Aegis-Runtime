import { Readable } from "node:stream";

export async function readJson(req: Request, maxBytes = 2_000_000): Promise<any> {
  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw Object.assign(new Error("Payload too large"), { status: 413 });
  }
  const text = new TextDecoder().decode(buf);
  try {
    return text.length ? JSON.parse(text) : {};
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

export function copyUpstreamHeaders(upstream: Response): Headers {
  const h = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) h.set("content-type", ct);

  for (const k of ["x-request-id", "openai-request-id"]) {
    const v = upstream.headers.get(k);
    if (v) h.set(k, v);
  }

  return h;
}

export function toNodeReadable(webStream: ReadableStream<Uint8Array>) {
  return Readable.fromWeb(webStream as any);
}
