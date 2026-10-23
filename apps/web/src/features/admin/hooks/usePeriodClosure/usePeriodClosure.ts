import { useCallback, useEffect, useState } from "react";

import {
  closePeriod,
  getPeriodClosure,
  reopenPeriod,
} from "@/services/grading.service";
import { getSchoolYears } from "@/services/school-year.service";
import type { PeriodClosure } from "@/types/academic/grading.types";
import type { SchoolYear } from "@/types/academic/school-year.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function usePeriodClosure() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [closure, setClosure] = useState<PeriodClosure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClosure, setIsLoadingClosure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadYears = useCallback(async () => {
    const years = await getSchoolYears();

    setSchoolYears(years);

    return years;
  }, []);

  useEffect(() => {
    loadYears()
      .then((years) => {
        const year = years.find((y) => y.status === "ACTIVE") ?? years[0];

        setSelectedYearId(year?.id ?? "");
      })
      .catch((err) =>
        setError(getApiErrorMessage(err, "No se pudieron cargar los años lectivos."))
      )
      .finally(() => setIsLoading(false));
  }, [loadYears]);

  const selectedYear = schoolYears.find((y) => y.id === selectedYearId) ?? null;

  // Al cambiar de año se elige el periodo en curso (o el primero).
  useEffect(() => {
    const year = schoolYears.find((y) => y.id === selectedYearId);

    setSelectedPeriodId(
      (current) =>
        year?.periods.find((p) => p.id === current)?.id ??
        year?.periods.find((p) => p.isCurrent)?.id ??
        year?.periods[0]?.id ??
        ""
    );
  }, [schoolYears, selectedYearId]);

  const loadClosure = useCallback(async (periodId: string) => {
    if (!periodId) {
      setClosure(null);
      return;
    }

    setIsLoadingClosure(true);
    setError(null);

    try {
      setClosure(await getPeriodClosure(periodId));
    } catch (err) {
      setClosure(null);
      setError(getApiErrorMessage(err, "No se pudo revisar el estado del periodo."));
    } finally {
      setIsLoadingClosure(false);
    }
  }, []);

  useEffect(() => {
    void loadClosure(selectedPeriodId);
  }, [loadClosure, selectedPeriodId]);

  const run = useCallback(
    async (action: () => Promise<void>, failure: string) => {
      setIsSubmitting(true);
      setActionError(null);

      try {
        await action();
        await Promise.all([loadYears(), loadClosure(selectedPeriodId)]);

        return true;
      } catch (err) {
        setActionError(getApiErrorMessage(err, failure));

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadClosure, loadYears, selectedPeriodId]
  );

  const close = useCallback(
    (allowIncomplete: boolean) =>
      run(
        () => closePeriod(selectedPeriodId, allowIncomplete),
        "No se pudo cerrar el periodo."
      ),
    [run, selectedPeriodId]
  );

  const reopen = useCallback(
    (reason: string) =>
      run(
        () => reopenPeriod(selectedPeriodId, reason),
        "No se pudo reabrir el periodo."
      ),
    [run, selectedPeriodId]
  );

  return {
    schoolYears,
    selectedYear,
    selectedYearId,
    setSelectedYearId,
    selectedPeriodId,
    setSelectedPeriodId,
    closure,
    isLoading,
    isLoadingClosure,
    isSubmitting,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    close,
    reopen,
  };
}
