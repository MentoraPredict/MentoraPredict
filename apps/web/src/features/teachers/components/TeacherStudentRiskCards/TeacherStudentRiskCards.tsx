import { useNavigate } from "react-router-dom";

import Pagination from "@/components/molecules/Pagination";
import DropoutRiskCard from "@/features/dashboard/components/DropoutRiskCard";
import useTeacherStudentDropoutRisks from "@/features/dashboard/hooks/useTeacherStudentDropoutRisks";
import usePagination from "@/hooks/usePagination";
import { getTeacherCourseStudentDetailPath } from "@/routes/paths";

import type { CourseEnrolledStudent } from "@/types/course";

interface TeacherStudentRiskCardsProps {
  courseId: string;
  students: CourseEnrolledStudent[];
}

const CARDS_PER_PAGE = 6;

/** Una tarjeta de riesgo de deserción por estudiante; cada una abre su ficha. */
export default function TeacherStudentRiskCards({
  courseId,
  students,
}: TeacherStudentRiskCardsProps) {
  const navigate = useNavigate();
  const { currentPage, paginatedItems, totalItems, totalPages, setCurrentPage } =
    usePagination(students, CARDS_PER_PAGE);
  const risks = useTeacherStudentDropoutRisks(courseId, paginatedItems);

  if (students.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-600">
        No hay estudiantes que mostrar.
      </p>
    );
  }

  return (
    <div className="min-w-0">
      {totalPages > 1 ? (
        <div className="mb-4">
          <Pagination
            currentPage={currentPage}
            pageSize={CARDS_PER_PAGE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="estudiantes"
            onPageChange={setCurrentPage}
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedItems.map((student) => {
          const name =
            [student.user.firstName, student.user.lastName]
              .filter(Boolean)
              .join(" ") || student.user.email;

          return (
            <div
              key={student.id}
              role="link"
              tabIndex={0}
              onClick={() =>
                navigate(
                  `${getTeacherCourseStudentDetailPath(courseId, student.user.id)}#riesgo-desercion`,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(
                    `${getTeacherCourseStudentDetailPath(courseId, student.user.id)}#riesgo-desercion`,
                  );
                }
              }}
              className="cursor-pointer rounded-2xl transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <DropoutRiskCard
                estimate={risks.data[student.user.id] ?? null}
                isLoading={risks.isLoading}
                title={name}
                subtitle={student.user.email}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}