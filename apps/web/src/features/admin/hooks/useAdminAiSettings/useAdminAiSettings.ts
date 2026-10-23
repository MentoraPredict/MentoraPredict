import { useCallback, useEffect, useState } from "react";

import {
  getAiSettings,
  getAiUsage,
  testAiConnection,
  updateAiSettings,
} from "@/services/ai-settings.service";
import type {
  AiConnectionCheck,
  AiSettings,
  AiUsageSummary,
  UpdateAiSettingsPayload,
} from "@/types/academic/ai-settings.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function useAdminAiSettings() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [usage, setUsage] = useState<AiUsageSummary | null>(null);
  const [usageDays, setUsageDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [connection, setConnection] = useState<AiConnectionCheck | null>(null);

  const loadUsage = useCallback(async (days: number) => {
    try {
      setUsage(await getAiUsage(days));
    } catch {
      setUsage(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAiSettings(), getAiUsage(usageDays).catch(() => null)])
      .then(([loadedSettings, loadedUsage]) => {
        if (cancelled) return;
        setSettings(loadedSettings);
        setUsage(loadedUsage);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "No se pudo cargar la configuración de IA."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (payload: UpdateAiSettingsPayload) => {
      setIsSaving(true);
      setActionError(null);
      setSaved(false);

      try {
        setSettings(await updateAiSettings(payload));
        setSaved(true);
        setConnection(null);
        return true;
      } catch (err) {
        setActionError(getApiErrorMessage(err, "No se pudo guardar la configuración."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const test = useCallback(
    async (candidate?: { apiKey?: string; model?: string }) => {
      setIsTesting(true);
      setActionError(null);
      setConnection(null);

      try {
        setConnection(await testAiConnection(candidate));
        await loadUsage(usageDays);
      } catch (err) {
        setActionError(getApiErrorMessage(err, "No se pudo probar la conexión."));
      } finally {
        setIsTesting(false);
      }
    },
    [loadUsage, usageDays]
  );

  const changeUsageDays = useCallback(
    async (days: number) => {
      setUsageDays(days);
      await loadUsage(days);
    },
    [loadUsage]
  );

  return {
    settings,
    usage,
    usageDays,
    isLoading,
    isSaving,
    isTesting,
    error,
    actionError,
    saved,
    connection,
    save,
    test,
    changeUsageDays,
    clearActionError: () => setActionError(null),
  };
}