import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import useStudentResults from "@/features/students/hooks/useStudentResults";
import {
  OUTCOME_LABELS,
  SUBJECT_STATUS_LABELS,
  SUGGESTION_LABELS,
  type SubjectResultStatus,
} from "@/types/academic/grading.types";

interface StudentResultsReportProps {
  studentId: string | undefined;
}

const STATUS_TONE: Record<SubjectResultStatus, "green" | "amber" | "red" | "neutral"> = {
  APPROVED: "green",
  SUPPLEMENTARY_PENDING: "amber",
  FAILED: "red",
  INCOMPLETE: "neutral",
};

export default function StudentResultsReport({ studentId }: StudentResultsReportProps) {
  const { results, isLoading, error } = useStudentResults(studentId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando calificaciones...</Text>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Text variant="small" className="font-medium text-amber-800">
          {error ?? "Todavía no hay calificaciones para mostrar."}
        </Text>
      </div>
    );
  }

  const { scale, result, decision } = results;
  const bandLabel = new Map(scale.bands.map((band) => [band.code, band.label]));
  const fmt = (value: number | null) => (value === null ? "—" : value.toFixed(scale.decimals));
  const tone = (value: number | null) =>
    value !== null && value < scale.passingGrade ? "text-red-700" : "text-gray-900";

  return (
    <div className="space-y-5">
      <div>
        <Heading as="h4" className="text-gray-900">
          {results.studentName}
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          {results.schoolYear.name} · {results.enrollment.sectionLabel} · escala{" "}
          {scale.minValue}–{scale.maxValue}, mínimo {scale.passingGrade}
        </Text>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Asignatura</th>
              {result.periods.map((period) => (
                <th key={period.id} className="px-3 py-3 text-center font-medium">
                  {period.name}
                  {period.isClosed ? "" : " *"}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-medium">Promedio anual</th>
              <th className="px-3 py-3 text-center font-medium">Supletorio</th>
              <th className="px-3 py-3 text-center font-medium">Nota final</th>
              <th className="px-3 py-3 font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.courses.map((course) => (
              <tr key={course.subjectId}>
                <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
                {course.periods.map((cell) => (
                  <td
                    key={cell.periodId}
                    className={`px-3 py-3 text-center ${
                      cell.isClosed ? tone(cell.value) : "text-gray-400"
                    }`}
                  >
                    {fmt(cell.value)}
                  </td>
                ))}
                <td className={`px-3 py-3 text-center font-medium ${tone(course.annualAverage)}`}>
                  {fmt(course.annualAverage)}
                </td>
                <td className="px-3 py-3 text-center text-gray-700">
                  {fmt(course.supplementaryGrade)}
                </td>
                <td className={`px-3 py-3 text-center font-semibold ${tone(course.finalGrade)}`}>
                  {fmt(course.finalGrade)}
                  {course.bandCode ? (
                    <span className="mt-0.5 block text-xs font-normal text-gray-500">
                      {bandLabel.get(course.bandCode) ?? course.bandCode}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={STATUS_TONE[course.status]}>
                    {SUBJECT_STATUS_LABELS[course.status]}
                  </Badge>
                </td>
              </tr>
            ))}

            {result.courses.length === 0 ? (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-gray-600">
                  El paralelo aún no tiene asignaturas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Text variant="caption" className="text-gray-500">
        * Periodo en curso: la nota es provisional y no cuenta para el promedio
        anual hasta que la institución cierre el periodo.
      </Text>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Heading as="h5" className="text-gray-900">
            Promoción
          </Heading>
          {decision ? (
            <Badge tone={decision.outcome === "PROMOTED" ? "green" : "amber"}>
              {OUTCOME_LABELS[decision.outcome]}
            </Badge>
          ) : (
            <Badge tone="neutral">{SUGGESTION_LABELS[result.suggestion]}</Badge>
          )}
        </div>
        <Text variant="small" className="mt-2 text-gray-600">
          {decision
            ? "Decisión confirmada por la autoridad de la institución."
            : "Sugerencia calculada con las notas actuales; la autoridad la confirma al terminar el año lectivo."}
        </Text>
        {!decision && result.reasons.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {result.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
