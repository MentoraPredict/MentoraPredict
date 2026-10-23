import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";

import {
  createSection,
  deleteSection,
  generateSectionCourses,
  getGradeLevels,
  getSections,
  updateSection,
} from "@/services/academic-structure.service";
import { getSchoolYears } from "@/services/school-year.service";
import { getTeachers } from "@/services/users/users.service";
import type {
  CreateSectionPayload,
  GenerateCoursesResult,
  GradeLevel,
  Section,
  UpdateSectionPayload,
} from "@/types/academic/academic-structure.types";
import type { SchoolYear } from "@/types/academic/school-year.types";
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

export default function useAdminStructure() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadBase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [years, grades, teacherList] = await Promise.all([
        getSchoolYears(),
        getGradeLevels(),
        getTeachers().catch(() => [] as AppUser[]),
      ]);

      setSchoolYears(years);
      setGradeLevels(grades);
      setTeachers(teacherList);
      setSelectedYearId(
        (current) =>
          current ||
          years.find((year) => year.status === "ACTIVE")?.id ||
          years[0]?.id ||
          ""
      );
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la estructura académica."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSections = useCallback(async (yearId: string) => {
    if (!yearId) {
      setSections([]);
      return;
    }

    try {
      setSections(await getSections(yearId));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar los paralelos."));
    }
  }, []);

  useEffect(() => {
    void loadBase();
  }, [loadBase]);

  useEffect(() => {
    void loadSections(selectedYearId);
  }, [loadSections, selectedYearId]);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, fallback: string) => {
      setIsSubmitting(true);
      setActionError(null);
      setNotice(null);

      try {
        const result = await action();
        await loadSections(selectedYearId);
        return { ok: true as const, result };
      } catch (err) {
        setActionError(getErrorMessage(err, fallback));
        return { ok: false as const };
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadSections, selectedYearId]
  );

  const create = useCallback(
    async (payload: Omit<CreateSectionPayload, "schoolYearId">) =>
      (
        await run(
          () => createSection({ ...payload, schoolYearId: selectedYearId }),
          "No se pudo crear el paralelo."
        )
      ).ok,
    [run, selectedYearId]
  );

  const update = useCallback(
    async (id: string, payload: UpdateSectionPayload) =>
      (await run(() => updateSection(id, payload), "No se pudo actualizar el paralelo."))
        .ok,
    [run]
  );

  const remove = useCallback(
    async (id: string) =>
      (await run(() => deleteSection(id), "No se pudo eliminar el paralelo.")).ok,
    [run]
  );

  const generateCourses = useCallback(
    async (id: string) => {
      const outcome = await run<GenerateCoursesResult>(
        () => generateSectionCourses(id),
        "No se pudieron generar los cursos."
      );

      if (outcome.ok) {
        const { created, alreadyOffered } = outcome.result;
        setNotice(
          created > 0
            ? `Se crearon ${created} curso(s)${
                alreadyOffered > 0 ? ` (${alreadyOffered} ya existían)` : ""
              }.`
            : "El paralelo ya tiene todos los cursos de la malla."
        );
      }

      return outcome.ok;
    },
    [run]
  );

  const sectionsByGrade = useMemo(() => {
    const map = new Map<string, Section[]>();

    sections.forEach((section) => {
      map.set(section.gradeLevelCode, [
        ...(map.get(section.gradeLevelCode) ?? []),
        section,
      ]);
    });

    return map;
  }, [sections]);

  return {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    gradeLevels,
    sectionsByGrade,
    teachers,
    isLoading,
    isSubmitting,
    error,
    actionError,
    notice,
    clearActionError: () => setActionError(null),
    create,
    update,
    remove,
    generateCourses,
  };
}
