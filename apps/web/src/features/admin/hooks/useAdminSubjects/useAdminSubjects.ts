import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  createCatalogSubject,
  getCurriculum,
  getGradeLevels,
  getSubjectCatalog,
  setCurriculum,
  updateCatalogSubject,
} from "@/services/academic-structure.service";
import type {
  CatalogSubject,
  CreateCatalogSubjectPayload,
  CurriculumItem,
  GradeLevel,
} from "@/types/academic/academic-structure.types";

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

export default function useAdminSubjects() {
  const [catalog, setCatalog] = useState<CatalogSubject[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [curriculum, setCurriculumState] = useState<CurriculumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedCurriculum, setSavedCurriculum] = useState(false);

  const loadBase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [subjects, grades] = await Promise.all([
        getSubjectCatalog(),
        getGradeLevels(),
      ]);

      setCatalog(subjects);
      setGradeLevels(grades.filter((grade) => grade.isLevelActive));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el catálogo de asignaturas."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!selectedGrade) {
      setCurriculumState([]);
      return;
    }

    setSavedCurriculum(false);
    getCurriculum(selectedGrade)
      .then(setCurriculumState)
      .catch((err) =>
        setError(getErrorMessage(err, "No se pudo cargar la malla del grado."))
      );
  }, [selectedGrade]);

  const run = useCallback(async (action: () => Promise<unknown>, fallback: string) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      await action();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, fallback));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createSubject = useCallback(
    async (payload: CreateCatalogSubjectPayload) => {
      const ok = await run(
        () => createCatalogSubject(payload),
        "No se pudo crear la asignatura."
      );

      if (ok) await loadBase();
      return ok;
    },
    [run, loadBase]
  );

  const toggleSubject = useCallback(
    async (subject: CatalogSubject) => {
      const ok = await run(
        () => updateCatalogSubject(subject.id, { isActive: !subject.isActive }),
        "No se pudo actualizar la asignatura."
      );

      if (ok) await loadBase();
      return ok;
    },
    [run, loadBase]
  );

  const saveCurriculum = useCallback(
    async (items: { subjectCatalogId: string; weeklyHours: number }[]) => {
      setSavedCurriculum(false);
      const ok = await run(async () => {
        setCurriculumState(await setCurriculum(selectedGrade, items));
      }, "No se pudo guardar la malla.");

      setSavedCurriculum(ok);
      return ok;
    },
    [run, selectedGrade]
  );

  return {
    catalog,
    gradeLevels,
    selectedGrade,
    setSelectedGrade,
    curriculum,
    isLoading,
    isSubmitting,
    error,
    actionError,
    savedCurriculum,
    createSubject,
    toggleSubject,
    saveCurriculum,
  };
}
