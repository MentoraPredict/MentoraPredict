import { useCallback, useEffect, useState } from "react";

import {
  getSupplementaryCandidates,
  saveSupplementary,
} from "@/services/grading.service";
import type { SupplementaryCandidate } from "@/types/academic/grading.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function useSupplementary(courseId: string) {
  const [candidates, setCandidates] = useState<SupplementaryCandidate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setCandidates(await getSupplementaryCandidates(courseId));
      setDrafts({});
    } catch (err) {
      // Antes de cerrar los periodos no hay candidatos: no es un error para el docente.
      setCandidates([]);
      setError(getApiErrorMessage(err, "No se pudo cargar el supletorio."));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setDraft = useCallback((studentId: string, text: string) => {
    setNotice(null);
    setDrafts((current) => ({ ...current, [studentId]: text }));
  }, []);

  const value = (candidate: SupplementaryCandidate) =>
    drafts[candidate.studentId] ??
    (candidate.supplementaryGrade === null ? "" : String(candidate.supplementaryGrade));

  const save = useCallback(async () => {
    const entries = Object.entries(drafts)
      .map(([studentId, text]) => ({
        studentId,
        value: Number(text.trim().replace(",", ".")),
        text,
      }))
      .filter((entry) => entry.text.trim() !== "");

    if (entries.some((entry) => !Number.isFinite(entry.value))) {
      setError("Revisa las notas: hay valores que no son números.");
      return;
    }
    if (entries.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveSupplementary(
        courseId,
        entries.map(({ studentId, value: grade }) => ({ studentId, value: grade }))
      );
      setNotice("Notas de supletorio guardadas.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo guardar el supletorio."));
    } finally {
      setIsSaving(false);
    }
  }, [courseId, drafts, load]);

  return {
    candidates,
    isLoading,
    isSaving,
    error,
    notice,
    value,
    setDraft,
    hasChanges: Object.values(drafts).some((text) => text.trim() !== ""),
    save,
  };
}
