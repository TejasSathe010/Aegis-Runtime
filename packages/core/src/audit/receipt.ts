export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface AuditReceipt {
  v: 1;
  receiptId: string;
  tsMs: number;

  tenantId: string;
  runId: string;

  provider: string;
  model: string;
  operation: string; // e.g. "chat.completions"

  request: {
    requestId: string;
    stream: boolean;
    inputTokensUpperBound: number;
    outputTokensUpperBound: number;
  };

  result: {
    ok: boolean;
    status: number;
    providerRequestId?: string;
    usage?: Usage;
    estimatedUsd: number;
    actualUsd?: number;
    errorCode?: string;
    errorMessage?: string;
  };

  signature: {
    alg: "HS256";
    keyId: string;
    sig: string; // base64url
  };
}
