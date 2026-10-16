import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  getInstitutionConfig,
  updateAttendanceRule,
  updateGradingScale,
  updateInstitution,
  updateInstitutionLevels,
  updatePromotionRules,
} from "@/services/institution-config.service";
import type {
  InstitutionConfig,
} from "@/types/academic/institution-config.types";

export type ConfigSection =
  | "institution"
  | "levels"
  | "gradingScale"
  | "attendance"
  | "promotion";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(". ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function useInstitutionConfig() {
  const [config, setConfig] = useState<InstitutionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<ConfigSection | null>(
    null
  );
  const [sectionError, setSectionError] = useState<{
    section: ConfigSection;
    message: string;
  } | null>(null);
  const [savedSection, setSavedSection] = useState<ConfigSection | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setConfig(await getInstitutionConfig());
    } catch (err) {
      setLoadError(
        getErrorMessage(err, "No se pudo cargar la configuración institucional.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (section: ConfigSection, action: () => Promise<unknown>) => {
      setSavingSection(section);
      setSectionError(null);
      setSavedSection(null);

      try {
        await action();
        // Se recarga todo: validaciones cruzadas pueden afectar otras secciones.
        setConfig(await getInstitutionConfig());
        setSavedSection(section);
        return true;
      } catch (err) {
        setSectionError({
          section,
          message: getErrorMessage(err, "No se pudieron guardar los cambios."),
        });
        return false;
      } finally {
        setSavingSection(null);
      }
    },
    []
  );

  return {
    config,
    isLoading,
    loadError,
    savingSection,
    sectionError,
    savedSection,
    saveInstitution: (payload: Parameters<typeof updateInstitution>[0]) =>
      save("institution", () => updateInstitution(payload)),
    saveLevels: (levels: Parameters<typeof updateInstitutionLevels>[0]) =>
      save("levels", () => updateInstitutionLevels(levels)),
    saveGradingScale: (payload: Parameters<typeof updateGradingScale>[0]) =>
      save("gradingScale", () => updateGradingScale(payload)),
    saveAttendanceRule: (payload: Parameters<typeof updateAttendanceRule>[0]) =>
      save("attendance", () => updateAttendanceRule(payload)),
    savePromotionRules: (rules: Parameters<typeof updatePromotionRules>[0]) =>
      save("promotion", () => updatePromotionRules(rules)),
  };
}
