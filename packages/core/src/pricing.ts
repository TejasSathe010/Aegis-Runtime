import { PricingError } from "./errors.js";

export interface ModelPrice {
  inputUsdPer1kTokens: number;
  outputUsdPer1kTokens: number;
}

export type PricingTable = Record<string, ModelPrice>; // key: `${provider}:${model}`

export function priceKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

export function estimateUsd(args: {
  pricing: PricingTable;
  provider: string;
  model: string;
  inputTokensUpperBound: number;
  outputTokensUpperBound: number;
}): number {
  const key = priceKey(args.provider, args.model);
  const p = args.pricing[key];
  if (!p) {
    throw new PricingError(`Missing price for ${key}. Provide pricing table explicitly.`);
  }
  const inUsd = (args.inputTokensUpperBound / 1000) * p.inputUsdPer1kTokens;
  const outUsd = (args.outputTokensUpperBound / 1000) * p.outputUsdPer1kTokens;
  return inUsd + outUsd;
}

export function computeActualUsd(args: {
  pricing: PricingTable;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): number {
  return estimateUsd({
    pricing: args.pricing,
    provider: args.provider,
    model: args.model,
    inputTokensUpperBound: args.inputTokens,
    outputTokensUpperBound: args.outputTokens
  });
}
