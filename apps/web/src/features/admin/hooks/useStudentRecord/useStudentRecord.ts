import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  getStudentConsents,
  getStudentGuardians,
  getStudentProfile,
  linkGuardian,
  saveStudentProfile,
  unlinkGuardian,
} from "@/services/people-enrollment.service";
import { getUsers } from "@/services/users/users.service";
import type {
  Consent,
  GuardianLink,
  LinkGuardianPayload,
  StudentProfile,
  StudentProfilePayload,
} from "@/types/academic/people-enrollment.types";
import type { AppUser } from "@/types/user/user.types";

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

/** Ficha, representantes y consentimientos de un estudiante. */
export default function useStudentRecord(studentId: string) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [guardians, setGuardians] = useState<GuardianLink[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [guardianCandidates, setGuardianCandidates] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextProfile, nextGuardians, nextConsents] = await Promise.all([
        getStudentProfile(studentId),
        getStudentGuardians(studentId),
        getStudentConsents(studentId),
      ]);

      setProfile(nextProfile);
      setGuardians(nextGuardians);
      setConsents(nextConsents);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la ficha del estudiante."));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const searchGuardians = useCallback(async (search: string) => {
    try {
      const page = await getUsers({
        role: "GUARDIAN",
        status: "ACTIVE",
        search,
        page: 1,
        limit: 20,
      });

      setGuardianCandidates(page.data);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo buscar representantes."));
    }
  }, []);

  const run = useCallback(async (action: () => Promise<unknown>, fallback: string) => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      await action();
      return true;
    } catch (err) {
      setError(getErrorMessage(err, fallback));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (payload: StudentProfilePayload) => {
      const ok = await run(async () => {
        setProfile(await saveStudentProfile(studentId, payload));
      }, "No se pudo guardar la ficha.");

      setSaved(ok);
      return ok;
    },
    [run, studentId]
  );

  const link = useCallback(
    async (payload: LinkGuardianPayload) => {
      const ok = await run(
        () => linkGuardian(studentId, payload),
        "No se pudo vincular al representante."
      );

      if (ok) setGuardians(await getStudentGuardians(studentId));
      return ok;
    },
    [run, studentId]
  );

  const unlink = useCallback(
    async (guardianId: string) => {
      const ok = await run(
        () => unlinkGuardian(studentId, guardianId),
        "No se pudo desvincular al representante."
      );

      if (ok) setGuardians(await getStudentGuardians(studentId));
      return ok;
    },
    [run, studentId]
  );

  return {
    profile,
    guardians,
    consents,
    guardianCandidates,
    searchGuardians,
    isLoading,
    isSaving,
    error,
    saved,
    saveProfile,
    link,
    unlink,
  };
}
