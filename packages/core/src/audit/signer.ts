import crypto from "crypto";
import { toBase64Url } from "../utils/base64url.js";
import { stableStringify } from "../utils/stableStringify.js";

export interface ReceiptSigner {
  keyId: string;
  sign(payload: unknown): Promise<string>; // base64url
}

export class HmacSha256Signer implements ReceiptSigner {
  readonly keyId: string;
  private readonly secret: Uint8Array;

  constructor(args: { keyId: string; secret: Uint8Array }) {
    this.keyId = args.keyId;
    this.secret = args.secret;
  }

  async sign(payload: unknown): Promise<string> {
    const msg = stableStringify(payload);
    // Node crypto for v1 (data-plane runs on Node/edge; edge variant can use WebCrypto later)
    const h = crypto.createHmac("sha256", Buffer.from(this.secret));
    h.update(msg);
    return toBase64Url(h.digest());
  }
}
