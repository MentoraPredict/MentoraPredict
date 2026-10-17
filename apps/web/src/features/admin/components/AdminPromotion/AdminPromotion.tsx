import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import useSectionPromotion from "@/features/admin/hooks/useSectionPromotion";
import {
  OUTCOME_LABELS,
  SUBJECT_STATUS_LABELS,
  SUGGESTION_LABELS,
  type PromotionOutcome,
  type PromotionSuggestion,
  type SectionPromotionRow,
} from "@/types/academic/grading.types";
import { SHIFT_LABELS } from "@/types/academic/institution-config.types";

const SUGGESTION_TONE: Record<PromotionSuggestion, "green" | "red" | "amber" | "neutral"> = {
  PROMOTED: "green",
  REPEATS: "red",
  REVIEW: "amber",
  PENDING_SUPPLEMENTARY: "amber",
  PENDING: "neutral",
};

const isDecidable = (row: SectionPromotionRow) =>
  row.suggestion !== "PENDING" && row.suggestion !== "PENDING_SUPPLEMENTARY";

const fmt = (value: number | null) => (value === null ? "—" : value.toFixed(2));

export default function AdminPromotion() {
  const {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    sections,
    gradeNames,
    selectedSectionId,
    setSelectedSectionId,
    rows,
    failures,
    confirmedCount,
    isLoading,
    isLoadingRows,
    isSubmitting,
    error,
    confirm,
  } = useSectionPromotion();
  const [outcomes, setOutcomes] = useState<Record<string, PromotionOutcome>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const outcomeOf = (row: SectionPromotionRow): PromotionOutcome | "" =>
    outcomes[row.enrollmentId] ??
    row.decision?.outcome ??
    (row.suggestion === "PROMOTED" || row.suggestion === "REPEATS" ? row.suggestion : "");

  const needsNotes = (row: SectionPromotionRow) => {
    const outcome = outcomeOf(row);

    // Resolver un caso en revisión, o contradecir la sugerencia, exige dejar el motivo.
    return row.suggestion === "REVIEW" || (outcome !== "" && outcome !== row.suggestion);
  };

  const toggle = (id: string) =>
    setChecked((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const selectSuggested = () =>
    setChecked(
      new Set(
        rows
          .filter((row) => (row.suggestion === "PROMOTED" || row.suggestion === "REPEATS") && !row.decision)
          .map((row) => row.enrollmentId)
      )
    );

  const selectedRows = rows.filter((row) => checked.has(row.enrollmentId));
  const canSubmit =
    selectedRows.length > 0 &&
    selectedRows.every(
      (row) =>
        isDecidable(row) &&
        outcomeOf(row) !== "" &&
        (!needsNotes(row) || (notes[row.enrollmentId] ?? row.decision?.notes ?? "").trim().length >= 5)
    );

  const submit = async () => {
    await confirm(
      selectedRows.map((row) => ({
        studentEnrollmentId: row.enrollmentId,
        outcome: outcomeOf(row) as PromotionOutcome,
        notes: (notes[row.enrollmentId] ?? row.decision?.notes ?? "").trim() || null,
      }))
    );
    setChecked(new Set());
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Promoción
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          El sistema sugiere promoción o repetición según las reglas de cada nivel y las
          notas de los periodos cerrados. La autoridad confirma cada caso; si decide algo
          distinto debe dejar el motivo.
        </Text>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="promo-year">Año lectivo</Label>
          <Select
            id="promo-year"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
          >
            {schoolYears.length === 0 ? <option value="">Sin años lectivos</option> : null}
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="promo-section">Paralelo</Label>
          <Select
            id="promo-section"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="">Selecciona un paralelo</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {gradeNames.get(section.gradeLevelCode) ?? section.gradeLevelCode} «{section.name}» ·{" "}
                {SHIFT_LABELS[section.shift]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {confirmedCount > 0 ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            {confirmedCount} decisión(es) confirmada(s).
          </Text>
        </div>
      ) : null}

      {isLoading || isLoadingRows ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Calculando promoción...</Text>
        </div>
      ) : null}

      {!isLoading && !isLoadingRows && !selectedSectionId ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            Selecciona un paralelo para revisar la promoción de sus estudiantes.
          </Text>
        </div>
      ) : null}

      {!isLoading && !isLoadingRows && selectedSectionId ? (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <Text variant="small" className="text-gray-600">
              {rows.length} estudiante(s)
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={selectSuggested}>
                Seleccionar sugeridos sin decidir
              </Button>
              <Button
                type="button"
                isLoading={isSubmitting}
                disabled={!canSubmit}
                onClick={() => void submit()}
              >
                Confirmar seleccionados ({selectedRows.length})
              </Button>
            </div>
          </header>

          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {rows.map((row) => {
              const decidable = isDecidable(row);
              const failure = failures.get(row.enrollmentId);

              return (
                <div key={row.enrollmentId} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar a ${row.studentName}`}
                      disabled={!decidable}
                      checked={checked.has(row.enrollmentId)}
                      onChange={() => toggle(row.enrollmentId)}
                    />

                    <div className="min-w-[12rem] flex-1">
                      <Text variant="small" className="font-medium text-gray-900">
                        {row.studentName}
                      </Text>
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() =>
                          setExpanded(expanded === row.enrollmentId ? null : row.enrollmentId)
                        }
                      >
                        {expanded === row.enrollmentId ? "Ocultar notas" : "Ver notas finales"}
                      </button>
                    </div>

                    <Badge tone={SUGGESTION_TONE[row.suggestion]}>
                      Sugerido: {SUGGESTION_LABELS[row.suggestion]}
                    </Badge>

                    {row.decision ? (
                      <Badge tone={row.decision.outcome === "PROMOTED" ? "green" : "amber"}>
                        Confirmado: {OUTCOME_LABELS[row.decision.outcome]}
                      </Badge>
                    ) : null}

                    <Select
                      aria-label={`Decisión para ${row.studentName}`}
                      className="w-44 py-2"
                      disabled={!decidable}
                      value={outcomeOf(row)}
                      onChange={(e) =>
                        setOutcomes((current) => ({
                          ...current,
                          [row.enrollmentId]: e.target.value as PromotionOutcome,
                        }))
                      }
                    >
                      <option value="">Sin decidir</option>
                      <option value="PROMOTED">{OUTCOME_LABELS.PROMOTED}</option>
                      <option value="REPEATS">{OUTCOME_LABELS.REPEATS}</option>
                    </Select>
                  </div>

                  {row.reasons.length > 0 ? (
                    <Text variant="caption" className="mt-1 text-gray-600">
                      {row.reasons.join(" · ")}
                    </Text>
                  ) : null}

                  {decidable && needsNotes(row) ? (
                    <div className="mt-2 max-w-xl">
                      <Input
                        aria-label={`Motivo para ${row.studentName}`}
                        placeholder="Motivo de la decisión (obligatorio)"
                        maxLength={500}
                        className="py-2"
                        value={notes[row.enrollmentId] ?? row.decision?.notes ?? ""}
                        onChange={(e) =>
                          setNotes((current) => ({ ...current, [row.enrollmentId]: e.target.value }))
                        }
                      />
                    </div>
                  ) : null}

                  {failure ? (
                    <Text variant="caption" className="mt-1 font-medium text-red-700">
                      {failure.join(" ")}
                    </Text>
                  ) : null}

                  {expanded === row.enrollmentId ? (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[28rem] text-left text-xs">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-3 py-2 font-medium">Asignatura</th>
                            <th className="px-3 py-2 text-center font-medium">Promedio</th>
                            <th className="px-3 py-2 text-center font-medium">Supletorio</th>
                            <th className="px-3 py-2 text-center font-medium">Final</th>
                            <th className="px-3 py-2 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {row.courses.map((course) => (
                            <tr key={course.subjectId}>
                              <td className="px-3 py-2 text-gray-900">{course.name}</td>
                              <td className="px-3 py-2 text-center">{fmt(course.annualAverage)}</td>
                              <td className="px-3 py-2 text-center">{fmt(course.supplementaryGrade)}</td>
                              <td className="px-3 py-2 text-center font-medium">{fmt(course.finalGrade)}</td>
                              <td className="px-3 py-2">{SUBJECT_STATUS_LABELS[course.status]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {rows.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-600">
                <Text variant="small">Este paralelo no tiene estudiantes matriculados.</Text>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
