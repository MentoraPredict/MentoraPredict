import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  AiConnectionCheck,
  AiSettings,
  AiUsageSummary,
  UpdateAiSettingsPayload,
} from "@/types/academic/ai-settings.types";

export async function getAiSettings(): Promise<AiSettings> {
  const response = await api.get<AiSettings>(endpoints.prediction.aiSettings);
  return response.data;
}

export async function updateAiSettings(
  payload: UpdateAiSettingsPayload
): Promise<AiSettings> {
  const response = await api.put<AiSettings>(
    endpoints.prediction.aiSettings,
    payload
  );
  return response.data;
}

/** Prueba la clave enviada (sin guardarla) o, si no se envía, la que está en uso. */
export async function testAiConnection(candidate?: {
  apiKey?: string;
  model?: string;
}): Promise<AiConnectionCheck> {
  const response = await api.post<AiConnectionCheck>(
    endpoints.prediction.aiSettingsTest,
    candidate ?? {}
  );
  return response.data;
}

export async function getAiUsage(days = 30): Promise<AiUsageSummary> {
  const response = await api.get<AiUsageSummary>(endpoints.prediction.aiUsage, {
    params: { days },
  });
  return response.data;
}