import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import useSupplementary from "@/features/teachers/hooks/useSupplementary";

interface TeacherCourseSupplementaryProps {
  courseId: string;
  decimals: number;
}

/** Solo aparece cuando el curso tiene estudiantes que deben rendir supletorio. */
export default function TeacherCourseSupplementary({
  courseId,
  decimals,
}: TeacherCourseSupplementaryProps) {
  const { candidates, isLoading, isSaving, error, notice, value, setDraft, hasChanges, save } =
    useSupplementary(courseId);

  if (isLoading || (candidates.length === 0 && !error)) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
      <Heading as="h5" className="text-gray-900">
        Examen supletorio
      </Heading>
      <Text variant="caption" className="mt-1 text-gray-600">
        Estudiantes cuyo promedio anual no alcanza el mínimo pero les permite
        rendir el supletorio.
      </Text>

      {error ? (
        <Text variant="small" className="mt-3 font-medium text-red-700">
          {error}
        </Text>
      ) : null}
      {notice ? (
        <Text variant="small" className="mt-3 font-medium text-emerald-700">
          {notice}
        </Text>
      ) : null}

      <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
        {candidates.map((candidate) => (
          <div
            key={candidate.studentId}
            className="flex flex-wrap items-center gap-3 px-4 py-3"
          >
            <div className="min-w-[12rem] flex-1">
              <Text variant="small" className="font-medium text-gray-900">
                {candidate.studentName}
              </Text>
              <Text variant="caption" className="text-gray-500">
                Promedio anual: {candidate.annualAverage.toFixed(decimals)}
              </Text>
            </div>

            {candidate.status === "APPROVED" ? (
              <Badge tone="green">Aprobó</Badge>
            ) : candidate.status === "FAILED" ? (
              <Badge tone="red">No aprobó</Badge>
            ) : (
              <Badge tone="amber">Pendiente</Badge>
            )}

            <input
              inputMode="decimal"
              aria-label={`Nota de supletorio de ${candidate.studentName}`}
              value={value(candidate)}
              onChange={(e) => setDraft(candidate.studentId, e.target.value)}
              className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm outline-none focus:border-blue-700"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" isLoading={isSaving} disabled={!hasChanges} onClick={() => void save()}>
          Guardar supletorio
        </Button>
      </div>
    </section>
  );
}
