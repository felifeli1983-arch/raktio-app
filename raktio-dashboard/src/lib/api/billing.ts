import { api } from './client';

export interface Balance {
  organization_id: string;
  available_credits: number;
  reserved_credits: number;
  plan: Record<string, any> | null;
}

export interface LedgerEntry {
  ledger_id: string;
  organization_id: string;
  event_type: string;
  amount: number;
  balance_after: number;
  linked_simulation_id: string | null;
  note: string | null;
  created_at: string;
}

export interface UsageList {
  items: LedgerEntry[];
  total: number;
}

export interface CreditEstimate {
  credit_estimate: number;
  agent_count: number;
  duration_preset: string;
  platform_count: number;
  formula: string;
}

export interface Plan {
  plan_id: string;
  name: string;
  agent_limit: number;
  monthly_price: number;
  annual_price: number;
  included_credits: number;
  bonus_credits: number;
  is_enterprise: boolean;
  feature_flags: Record<string, any>;
}

export const billingApi = {
  balance: () =>
    api.get<Balance>('/api/billing/balance'),

  usage: (limit = 50) =>
    api.get<UsageList>('/api/billing/usage', { limit }),

  estimate: (data: { agent_count: number; duration_preset?: string; platform_scope?: string[]; geography_scope?: Record<string, any> }) =>
    api.post<CreditEstimate>('/api/billing/estimate', data),

  plans: () =>
    api.get<{ items: Plan[] }>('/api/billing/plans'),
};
