import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  changeSchoolYearStatus,
  createSchoolYear,
  deleteSchoolYear,
  getSchoolYears,
  updateGradingPeriod,
} from "@/services/school-year.service";
import type {
  CreateSchoolYearPayload,
  SchoolYear,
  SchoolYearStatus,
  UpdateGradingPeriodPayload,
} from "@/types/academic/school-year.types";

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

export default function useAdminSchoolYears() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setSchoolYears(await getSchoolYears());
    } catch (err) {
      setError(
        getErrorMessage(err, "No se pudieron cargar los años lectivos.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const runAction = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setIsSubmitting(true);
      setActionError(null);

      try {
        await action();
        await reload();
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, fallback));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reload]
  );

  const create = useCallback(
    (payload: CreateSchoolYearPayload) =>
      runAction(
        () => createSchoolYear(payload),
        "No se pudo crear el año lectivo."
      ),
    [runAction]
  );

  const changeStatus = useCallback(
    (id: string, status: SchoolYearStatus) =>
      runAction(
        () => changeSchoolYearStatus(id, status),
        "No se pudo cambiar el estado del año lectivo."
      ),
    [runAction]
  );

  const remove = useCallback(
    (id: string) =>
      runAction(
        () => deleteSchoolYear(id),
        "No se pudo eliminar el año lectivo."
      ),
    [runAction]
  );

  const savePeriod = useCallback(
    (periodId: string, payload: UpdateGradingPeriodPayload) =>
      runAction(
        () => updateGradingPeriod(periodId, payload),
        "No se pudo guardar el periodo."
      ),
    [runAction]
  );

  return {
    schoolYears,
    isLoading,
    isSubmitting,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    create,
    changeStatus,
    remove,
    savePeriod,
  };
}
