export type TenantId = string;
export type ProjectId = string;
export type EnvironmentId = "dev" | "staging" | "prod" | (string & {});

export type Capability =
  | "llm:invoke"
  | "tool:http"
  | "tool:db:read"
  | "tool:db:write"
  | "tool:files:read"
  | "tool:files:write"
  | (string & {});

export type BudgetWindow = "minute" | "hour" | "day" | "month";

export interface BudgetPolicy {
  window: BudgetWindow;
  limitUsd: number;     // hard cap for the window
  hardStop: true;       // v1: always hard-stop
}

export interface RoutingPolicy {
  primaryProvider: "openai" | (string & {});
  fallbackProviders?: Array<"openai" | (string & {})>;
}

export interface ModelPolicy {
  allowModels: string[];
}

export interface TenantPolicy {
  tenantId: TenantId;
  projectId?: ProjectId;
  environment?: EnvironmentId;

  budgets: {
    perRunUsd: number;
    perWindow: BudgetPolicy;
  };

  routing: RoutingPolicy;
  model: ModelPolicy;

  capabilities: Capability[];
}

export interface PolicyProvider {
  getPolicy(args: {
    tenantId: TenantId;
    projectId?: ProjectId;
    environment?: EnvironmentId;
    apiKeyId?: string;
  }): Promise<TenantPolicy>;
}
