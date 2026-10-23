import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  getGradingComponents,
  saveGradingComponents,
} from "@/services/grading.service";
import {
  getInstitutionConfig,
  updateAttendanceRule,
  updateGradingScale,
  updateInstitution,
  updateInstitutionLevels,
  updatePromotionRules,
} from "@/services/institution-config.service";
import type { GradingComponent } from "@/types/academic/grading.types";
import type {
  InstitutionConfig,
} from "@/types/academic/institution-config.types";

export type ConfigSection =
  | "institution"
  | "levels"
  | "gradingScale"
  | "gradingComponents"
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
  const [components, setComponents] = useState<GradingComponent[]>([]);
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
      const [loaded, loadedComponents] = await Promise.all([
        getInstitutionConfig(),
        getGradingComponents(),
      ]);

      setConfig(loaded);
      setComponents(loadedComponents);
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
        const [loaded, loadedComponents] = await Promise.all([
          getInstitutionConfig(),
          getGradingComponents(),
        ]);

        setConfig(loaded);
        setComponents(loadedComponents);
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
    components,
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
    saveComponents: (items: Parameters<typeof saveGradingComponents>[0]) =>
      save("gradingComponents", () => saveGradingComponents(items)),
    saveAttendanceRule: (payload: Parameters<typeof updateAttendanceRule>[0]) =>
      save("attendance", () => updateAttendanceRule(payload)),
    savePromotionRules: (rules: Parameters<typeof updatePromotionRules>[0]) =>
      save("promotion", () => updatePromotionRules(rules)),
  };
}
