import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { getRiskPresentation } from "@/features/dashboard/utils/riskLevelPresentation";

import type { Course } from "@/types/course";

interface StudentCoursesTableProps {
  courses: Course[];
  onCourseClick: (courseId: string) => void;
  onSecondaryAction?: (courseId: string) => void;
  secondaryActionLabel?: string;
}

const headerCellClassName =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500";

/** Lista de las materias del estudiante; cada fila abre la materia. */
export default function StudentCoursesTable({
  courses,
  onCourseClick,
  onSecondaryAction,
  secondaryActionLabel = "Registrar avance",
}: StudentCoursesTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className={headerCellClassName}>Materia</th>
            <th className={headerCellClassName}>Docente</th>
            <th className={headerCellClassName}>Periodo</th>
            <th className={headerCellClassName}>Promedio</th>
            <th className={headerCellClassName}>Riesgo</th>
            {onSecondaryAction ? <th className={headerCellClassName}>Acciones</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses.map((course) => {
            const risk = getRiskPresentation(course.riskLevel);

            return (
              <tr
                key={course.id}
                tabIndex={0}
                role="link"
                onClick={() => onCourseClick(course.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onCourseClick(course.id);
                }}
                className="cursor-pointer transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none"
              >
                <td className="px-4 py-3">
                  <Text variant="small" className="font-semibold text-gray-900">
                    {course.name}
                  </Text>
                  {course.code ? (
                    <Text variant="caption" className="text-gray-500">
                      {course.code}
                    </Text>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-gray-700">{course.teacherName}</td>
                <td className="px-4 py-3 text-gray-700">{course.semester}</td>
                <td className="px-4 py-3 text-gray-700">
                  {typeof course.currentAverage === "number"
                    ? `${course.currentAverage.toFixed(2)} / 10`
                    : "Sin promedio"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${risk.badgeClassName}`}
                  >
                    {risk.shortLabel}
                  </span>
                </td>
                {onSecondaryAction ? (
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSecondaryAction(course.id);
                      }}
                    >
                      {secondaryActionLabel}
                    </Button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}