import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";

import { getGradeLevels, getSections } from "@/services/academic-structure.service";
import {
  endEnrollment,
  enrollStudents,
  getSectionEnrollments,
} from "@/services/people-enrollment.service";
import { getSchoolYears } from "@/services/school-year.service";
import { getUsers } from "@/services/users/users.service";
import type {
  GradeLevel,
  Section,
} from "@/types/academic/academic-structure.types";
import type {
  EnrollmentResult,
  SectionEnrollment,
} from "@/types/academic/people-enrollment.types";
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

export default function useAdminEnrollments() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [enrollments, setEnrollments] = useState<SectionEnrollment[]>([]);
  const [candidates, setCandidates] = useState<AppUser[]>([]);
  const [results, setResults] = useState<EnrollmentResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSchoolYears(), getGradeLevels()])
      .then(([years, grades]) => {
        setSchoolYears(years);
        setGradeLevels(grades);
        setSelectedYearId(
          years.find((year) => year.status === "ACTIVE")?.id ?? years[0]?.id ?? ""
        );
      })
      .catch((err) =>
        setError(getErrorMessage(err, "No se pudo cargar la información base."))
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSelectedSectionId("");

    if (!selectedYearId) {
      setSections([]);
      return;
    }

    getSections(selectedYearId)
      .then((list) => setSections(list.filter((section) => section.isActive)))
      .catch((err) =>
        setError(getErrorMessage(err, "No se pudieron cargar los paralelos."))
      );
  }, [selectedYearId]);

  const loadEnrollments = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setEnrollments([]);
      return;
    }

    try {
      setEnrollments(await getSectionEnrollments(sectionId));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la matrícula del paralelo."));
    }
  }, []);

  useEffect(() => {
    void loadEnrollments(selectedSectionId);
  }, [loadEnrollments, selectedSectionId]);

  const searchStudents = useCallback(async (search: string) => {
    try {
      const page = await getUsers({
        role: "STUDENT",
        status: "ACTIVE",
        search,
        page: 1,
        limit: 30,
      });

      setCandidates(page.data);
    } catch (err) {
      setActionError(getErrorMessage(err, "No se pudo buscar estudiantes."));
    }
  }, []);

  const enroll = useCallback(
    async (studentIds: string[]) => {
      setIsSubmitting(true);
      setActionError(null);

      try {
        const outcome = await enrollStudents(selectedSectionId, studentIds);

        setResults(outcome);
        await loadEnrollments(selectedSectionId);
        setSections(
          (await getSections(selectedYearId)).filter((section) => section.isActive)
        );

        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, "No se pudo matricular a los estudiantes."));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadEnrollments, selectedSectionId, selectedYearId]
  );

  const end = useCallback(
    async (enrollmentId: string, status: "WITHDRAWN" | "TRANSFERRED") => {
      setIsSubmitting(true);
      setActionError(null);

      try {
        await endEnrollment(enrollmentId, status);
        await loadEnrollments(selectedSectionId);

        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, "No se pudo actualizar la matrícula."));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadEnrollments, selectedSectionId]
  );

  const gradeName = useMemo(
    () => new Map(gradeLevels.map((grade) => [grade.code, grade.name])),
    [gradeLevels]
  );

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  return {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    sections,
    gradeName,
    selectedSectionId,
    setSelectedSectionId,
    selectedSection,
    enrollments,
    candidates,
    results,
    clearResults: () => setResults(null),
    searchStudents,
    isLoading,
    isSubmitting,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    enroll,
    end,
  };
}
