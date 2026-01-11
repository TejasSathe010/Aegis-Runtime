import { createServer } from "node:http";
import { loadEnv } from "./env.js";
import { handleChatCompletions, handleHealthz } from "./handlers.js";

const env = loadEnv();

createServer(async (nodeReq, nodeRes) => {
  const ac = new AbortController();

  nodeReq.on("aborted", () => ac.abort());
  nodeRes.on("close", () => {
    if (!nodeRes.writableEnded) ac.abort();
  });
  nodeRes.on("error", () => ac.abort());

  try {
    const url = new URL(nodeReq.url ?? "/", `http://${nodeReq.headers.host ?? "localhost"}`);
    const method = nodeReq.method ?? "GET";

    const hasBody = method !== "GET" && method !== "HEAD";

    const init: any = {
      method,
      headers: nodeReq.headers as any
    };
    if (hasBody) {
      init.body = nodeReq as any;
      init.duplex = "half";
    }

    const req = new Request(url, init);

    let resp: Response;
    if (method === "GET" && url.pathname === "/healthz") {
      resp = await handleHealthz();
    } else if (method === "POST" && url.pathname === "/v1/chat/completions") {
      resp = await handleChatCompletions(req, env, ac.signal);
    } else {
      resp = new Response(JSON.stringify({ error: { message: "Not found" } }), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
    }

    nodeRes.statusCode = resp.status;
    resp.headers.forEach((v, k) => nodeRes.setHeader(k, v));

    if (!resp.body) return nodeRes.end();

    const reader = resp.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      nodeRes.write(Buffer.from(value));
    }
    nodeRes.end();
  } catch (err: any) {
    const status = typeof err?.status === "number" ? err.status : 500;
    nodeRes.statusCode = status;
    nodeRes.setHeader("content-type", "application/json");
    nodeRes.end(JSON.stringify({ error: { message: err?.message ?? "Internal error" } }));
  }
}).listen(env.port, () => {
  console.log(`[aegis-proxy] listening on http://localhost:${env.port}`);
  console.log(`[aegis-proxy] default provider: ${env.defaultProvider}`);
});
