import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  getMyStudents,
  getStudentConsents,
  grantConsent,
  revokeConsent,
} from "@/services/people-enrollment.service";
import type {
  Consent,
  ConsentPurpose,
  MyStudent,
} from "@/types/academic/people-enrollment.types";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function useMyStudents() {
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [consents, setConsents] = useState<Record<string, Consent[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await getMyStudents();
      const entries = await Promise.all(
        list.map(async (s) => [s.studentId, await getStudentConsents(s.studentId)] as const)
      );

      setStudents(list);
      setConsents(Object.fromEntries(entries));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la información de tus representados."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleConsent = useCallback(
    async (studentId: string, purpose: ConsentPurpose, granted: boolean) => {
      setPending(`${studentId}:${purpose}`);
      setError(null);

      try {
        if (granted) await revokeConsent(studentId, purpose);
        else await grantConsent(studentId, purpose);

        const updated = await getStudentConsents(studentId);

        setConsents((current) => ({ ...current, [studentId]: updated }));
      } catch (err) {
        setError(getErrorMessage(err, "No se pudo actualizar el consentimiento."));
      } finally {
        setPending(null);
      }
    },
    []
  );

  return { students, consents, isLoading, pending, error, toggleConsent };
}
