import Text from "@/components/atoms/Text";
import { getRiskPresentation } from "@/features/dashboard/utils/riskLevelPresentation";

import type { Course } from "@/types/course";

export interface TeacherCoursesTableMetrics {
  averageLabel: string;
  enrolledCount: number;
}

interface TeacherCoursesTableProps {
  courses: Course[];
  getCourseMetrics?: (course: Course) => TeacherCoursesTableMetrics | undefined;
  onCourseClick: (courseId: string) => void;
}

const headerCellClassName =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500";

export default function TeacherCoursesTable({
  courses,
  getCourseMetrics,
  onCourseClick,
}: TeacherCoursesTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className={headerCellClassName}>Materia</th>
            <th className={headerCellClassName}>Periodo</th>
            <th className={headerCellClassName}>Estudiantes</th>
            <th className={headerCellClassName}>Promedio</th>
            <th className={headerCellClassName}>Riesgo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses.map((course) => {
            const metrics = getCourseMetrics?.(course);
            const risk = getRiskPresentation(course.riskLevel);
            const isClickable = !course.isPendingSync;

            return (
              <tr
                key={course.id}
                tabIndex={isClickable ? 0 : undefined}
                onClick={() => isClickable && onCourseClick(course.id)}
                onKeyDown={(event) => {
                  if (isClickable && event.key === "Enter") {
                    onCourseClick(course.id);
                  }
                }}
                className={`transition ${
                  isClickable ? "cursor-pointer hover:bg-blue-50/40" : "opacity-70"
                }`}
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
                <td className="px-4 py-3 text-gray-700">{course.semester}</td>
                <td className="px-4 py-3 text-gray-700">
                  {metrics?.enrolledCount ?? course.enrolledCount ?? 0}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {metrics?.averageLabel ?? "Sin datos"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${risk.badgeClassName}`}
                  >
                    {risk.shortLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
