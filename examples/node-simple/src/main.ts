console.log("Run the proxy instead:");
console.log("  pnpm install");
console.log("  OPENAI_API_KEY=... pnpm dev:proxy");
console.log("Then call:");
console.log(`  curl http://localhost:8787/v1/chat/completions -H "content-type: application/json" -H "x-tenant-id: t1" -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"hi"}]}'`);
