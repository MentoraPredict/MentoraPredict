import { useEffect, useState } from "react";

import { getStudentResults } from "@/services/grading.service";
import type { StudentResults } from "@/types/academic/grading.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function useStudentResults(studentId: string | undefined) {
  const [results, setResults] = useState<StudentResults | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(studentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getStudentResults(studentId)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setResults(null);
          setError(getApiErrorMessage(err, "No se pudieron cargar las calificaciones."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { results, isLoading, error };
}
