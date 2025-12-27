export class AegisError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class BudgetExceededError extends AegisError {
  readonly status = 402;
  readonly remainingUsd: number;
  readonly neededUsd: number;

  constructor(args: { remainingUsd: number; neededUsd: number; message?: string }) {
    super(
      "BUDGET_EXCEEDED",
      args.message ?? `Budget exceeded: need $${args.neededUsd.toFixed(6)}, remaining $${args.remainingUsd.toFixed(6)}`
    );
    this.remainingUsd = args.remainingUsd;
    this.neededUsd = args.neededUsd;
  }
}

export class PolicyError extends AegisError {
  constructor(message: string) {
    super("POLICY_ERROR", message);
  }
}

export class PricingError extends AegisError {
  constructor(message: string) {
    super("PRICING_ERROR", message);
  }
}
