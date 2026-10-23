export type AiKeySource = "database" | "environment" | "none";

export interface AiSettings {
  configured: boolean;
  source: AiKeySource;
  keyLast4: string | null;
  model: string;
  defaultModel: string;
  enabled: boolean;
  updatedAt: string | null;
}

export interface UpdateAiSettingsPayload {
  apiKey?: string;
  clearApiKey?: boolean;
  model?: string;
  enabled?: boolean;
}

export interface AiConnectionCheck {
  ok: boolean;
  status: number | null;
  latencyMs: number;
  message: string;
}

export interface AiUsageRow {
  createdAt: string;
  model: string;
  kind: "recommendation" | "test";
  success: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  error: string | null;
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

export const AI_SOURCE_LABELS: Record<AiKeySource, string> = {
  database: "Guardada en el panel",
  environment: "Variable de entorno del servidor",
  none: "Sin configurar",
};