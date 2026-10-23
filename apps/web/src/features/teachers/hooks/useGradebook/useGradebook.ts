import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createActivity,
  getGradebook,
  saveGrades,
  setActivityActive,
  updateActivity,
} from "@/services/grading.service";
import type {
  ActivityPayload,
  GradeEntry,
  Gradebook,
} from "@/types/academic/grading.types";
import { getApiErrorMessage } from "@/utils/apiError";

const cellKey = (studentId: string, activityId: string) =>
  `${studentId}:${activityId}`;

/** Acepta coma o punto decimal; devuelve null si no es un número. */
function parseGrade(text: string): number | null {
  const normalized = text.trim().replace(",", ".");

  if (normalized === "") return null;

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
}

/** `initialPeriodId` abre el libro en ese periodo (si no, en el vigente). */
export default function useGradebook(courseId: string, initialPeriodId?: string) {
  const [gradebook, setGradebook] = useState<Gradebook | null>(null);
  const [periodId, setPeriodId] = useState<string | undefined>(undefined);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(
    async (nextPeriodId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getGradebook(courseId, nextPeriodId);

        setGradebook(data);
        setPeriodId(data.period.id);
        setDrafts({});
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo cargar el libro de calificaciones."));
      } finally {
        setIsLoading(false);
      }
    },
    [courseId]
  );

  useEffect(() => {
    void load(initialPeriodId);
  }, [load, initialPeriodId]);

  const selectPeriod = useCallback(
    (nextPeriodId: string) => {
      setNotice(null);
      void load(nextPeriodId);
    },
    [load]
  );

  const setDraft = useCallback(
    (studentId: string, activityId: string, text: string) => {
      setNotice(null);
      setDrafts((current) => ({ ...current, [cellKey(studentId, activityId)]: text }));
    },
    []
  );

  /** Lo que se mostrará en cada celda: el borrador o la nota guardada. */
  const cellValue = useCallback(
    (studentId: string, activityId: string): string => {
      const draft = drafts[cellKey(studentId, activityId)];

      if (draft !== undefined) return draft;

      const saved = gradebook?.students.find((s) => s.studentId === studentId)
        ?.grades[activityId];

      return saved === undefined ? "" : String(saved);
    },
    [drafts, gradebook]
  );

  /** Cambios pendientes: celdas editadas cuyo valor es distinto al guardado. */
  const pending = useMemo(() => {
    const entries: GradeEntry[] = [];
    const invalid = new Set<string>();

    for (const [key, text] of Object.entries(drafts)) {
      const [studentId, activityId] = key.split(":");
      const saved = gradebook?.students.find((s) => s.studentId === studentId)
        ?.grades[activityId];

      if (text.trim() === "") continue;

      const value = parseGrade(text);

      if (value === null) {
        invalid.add(key);
        continue;
      }

      const scale = gradebook?.scale;

      if (scale && (value < scale.minValue || value > scale.maxValue)) {
        invalid.add(key);
        continue;
      }

      if (value !== saved) entries.push({ studentId, activityId, value });
    }

    return { entries, invalid };
  }, [drafts, gradebook]);

  const isInvalid = useCallback(
    (studentId: string, activityId: string) =>
      pending.invalid.has(cellKey(studentId, activityId)),
    [pending]
  );

  const save = useCallback(async () => {
    if (!gradebook || pending.entries.length === 0 || pending.invalid.size > 0) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await saveGrades(courseId, gradebook.period.id, pending.entries);

      setNotice(
        `Notas guardadas: ${result.created} nuevas, ${result.updated} actualizadas.`
      );
      await load(gradebook.period.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron guardar las notas."));
    } finally {
      setIsSaving(false);
    }
  }, [courseId, gradebook, load, pending]);

  const addActivity = useCallback(
    async (payload: Omit<ActivityPayload, "periodId">) => {
      if (!gradebook) return false;

      setIsSaving(true);
      setError(null);

      try {
        await createActivity(courseId, { ...payload, periodId: gradebook.period.id });
        await load(gradebook.period.id);

        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo crear la actividad."));

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, gradebook, load]
  );

  const editActivity = useCallback(
    async (
      activityId: string,
      payload: { name?: string; componentCode?: string; dueDate?: string | null }
    ) => {
      if (!gradebook) return false;

      setIsSaving(true);
      setError(null);

      try {
        await updateActivity(activityId, payload);
        await load(gradebook.period.id);

        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo guardar la actividad."));

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [gradebook, load]
  );

  const archiveActivity = useCallback(
    async (activityId: string) => {
      if (!gradebook) return false;

      setIsSaving(true);
      setError(null);

      try {
        await setActivityActive(activityId, false);
        await load(gradebook.period.id);

        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo archivar la actividad."));

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [gradebook, load]
  );

  return {
    gradebook,
    periodId,
    isLoading,
    isSaving,
    error,
    notice,
    selectPeriod,
    cellValue,
    setDraft,
    isInvalid,
    pendingCount: pending.entries.length,
    hasInvalid: pending.invalid.size > 0,
    save,
    addActivity,
    editActivity,
    archiveActivity,
  };
}
