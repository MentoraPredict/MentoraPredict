import { useCallback, useEffect, useState } from "react";

import { getStudentAttendance, requestJustification } from "@/services/attendance.service";
import type { StudentAttendance } from "@/types/academic/attendance.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function useStudentAttendance(studentId: string | undefined) {
  const [data, setData] = useState<StudentAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(studentId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) return;

    try {
      setData(await getStudentAttendance(studentId));
      setError(null);
    } catch (err) {
      setData(null);
      setError(getApiErrorMessage(err, "No se pudo cargar la asistencia."));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const justify = useCallback(
    async (sessionId: string, reason: string) => {
      if (!studentId) return false;

      setIsSubmitting(true);
      setActionError(null);

      try {
        await requestJustification(studentId, sessionId, reason);
        await load();

        return true;
      } catch (err) {
        setActionError(getApiErrorMessage(err, "No se pudo enviar la justificación."));

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, studentId]
  );

  return {
    data,
    isLoading,
    isSubmitting,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    justify,
  };
}
