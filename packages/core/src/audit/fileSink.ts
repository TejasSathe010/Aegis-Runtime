import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { ReceiptSink } from "./sink.js";
import type { AuditReceipt } from "./receipt.js";
import { stableStringify } from "../utils/stableStringify.js";

export class FileReceiptSink implements ReceiptSink {
  private readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  async write(receipt: AuditReceipt): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const p = path.join(this.dir, `${receipt.tsMs}-${receipt.receiptId}.json`);
    await writeFile(p, stableStringify(receipt) + "\n", "utf8");
  }
}
