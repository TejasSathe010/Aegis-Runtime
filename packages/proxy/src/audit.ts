import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { ProxyEnv } from "./env.js";
import type { Provider } from "./env.js";
import type { Usage } from "./sseTap.js";

export type AuditRecord = {
  audit_id: string;
  ts_ms: number;
  duration_ms: number;

  tenant_id?: string;
  run_id?: string;

  provider: Provider;
  model?: string;
  stream: boolean;

  status: number;
  usage?: Usage;

  error_message?: string;
};

function safeName(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function writeAudit(env: ProxyEnv, rec: Omit<AuditRecord, "audit_id">): Promise<string | null> {
  if (!env.auditEnabled) return null;

  const audit_id = crypto.randomUUID();
  const full: AuditRecord = { audit_id, ...rec };

  await fs.mkdir(env.auditDir, { recursive: true });
  const file = path.join(env.auditDir, `${Date.now()}_${safeName(audit_id)}.json`);
  await fs.writeFile(file, JSON.stringify(full, null, 2), "utf8");

  return audit_id;
}
