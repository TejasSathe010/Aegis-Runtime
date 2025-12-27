import type { AuditReceipt } from "./receipt.js";

export interface ReceiptSink {
  write(receipt: AuditReceipt): Promise<void>;
}
