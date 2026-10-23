export type AiUsageKind = 'recommendation' | 'test';

export interface AiUsageEntry {
  model: string;
  kind: AiUsageKind;
  success: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  error: string | null;
}

export interface AiUsageRow extends AiUsageEntry {
  createdAt: Date;
}

export interface AiUsageSummary {
  days: number;
  totals: {
    calls: number;
    failures: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  byDay: Array<{ date: string; calls: number; totalTokens: number }>;
  byModel: Array<{ model: string; calls: number; totalTokens: number }>;
  recent: AiUsageRow[];
}

export interface IAiUsageRepository {
  add(entry: AiUsageEntry): Promise<void>;
  summarize(days: number, recentLimit: number): Promise<AiUsageSummary>;
}