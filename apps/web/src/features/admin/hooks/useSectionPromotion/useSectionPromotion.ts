import { useCallback, useEffect, useMemo, useState } from "react";

import { getGradeLevels, getSections } from "@/services/academic-structure.service";
import { confirmPromotion, getSectionPromotion } from "@/services/grading.service";
import { getSchoolYears } from "@/services/school-year.service";
import type { Section } from "@/types/academic/academic-structure.types";
import type {
  PromotionConfirmResult,
  PromotionDecisionPayload,
  SectionPromotionRow,
} from "@/types/academic/grading.types";
import type { SchoolYear } from "@/types/academic/school-year.types";
import { getApiErrorMessage } from "@/utils/apiError";

export default function useSectionPromotion() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [gradeNames, setGradeNames] = useState<Map<string, string>>(new Map());
  const [selectedYearId, setSelectedYearId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [rows, setRows] = useState<SectionPromotionRow[]>([]);
  const [results, setResults] = useState<PromotionConfirmResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSchoolYears(), getGradeLevels()])
      .then(([years, grades]) => {
        setSchoolYears(years);
        setGradeNames(new Map(grades.map((grade) => [grade.code, grade.name])));
        setSelectedYearId(years.find((y) => y.status === "ACTIVE")?.id ?? years[0]?.id ?? "");
      })
      .catch((err) =>
        setError(getApiErrorMessage(err, "No se pudo cargar la información base."))
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
        setError(getApiErrorMessage(err, "No se pudieron cargar los paralelos."))
      );
  }, [selectedYearId]);

  const loadRows = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setRows([]);
      return;
    }

    setIsLoadingRows(true);
    setError(null);

    try {
      setRows(await getSectionPromotion(sectionId));
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err, "No se pudo calcular la promoción del paralelo."));
    } finally {
      setIsLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    setResults(null);
    void loadRows(selectedSectionId);
  }, [loadRows, selectedSectionId]);

  const confirm = useCallback(
    async (decisions: PromotionDecisionPayload[]) => {
      setIsSubmitting(true);
      setError(null);

      try {
        setResults(await confirmPromotion(selectedSectionId, decisions));
        await loadRows(selectedSectionId);
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudieron confirmar las decisiones."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadRows, selectedSectionId]
  );

  const failures = useMemo(
    () => new Map((results ?? []).filter((r) => !r.ok).map((r) => [r.studentEnrollmentId, r.errors])),
    [results]
  );

  return {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    sections,
    gradeNames,
    selectedSectionId,
    setSelectedSectionId,
    rows,
    failures,
    confirmedCount: (results ?? []).filter((r) => r.ok).length,
    isLoading,
    isLoadingRows,
    isSubmitting,
    error,
    confirm,
  };
}
