export interface Config {
  openaiApiKey: string;
  geminiApiKey: string;
  model: string;
  provider: 'openai' | 'gemini';
  enableGovernance: boolean;
  perRunUsd: number;
  perMinuteUsd: number;
  perDayUsd: number;
  tenantId: string;
  runId: string;
}

export interface DemoResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
  timestamp: Date;
}

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}
