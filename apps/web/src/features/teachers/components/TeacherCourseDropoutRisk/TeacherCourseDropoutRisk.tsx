import { useEffect, useState } from "react";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import DropoutRiskCard from "@/features/dashboard/components/DropoutRiskCard";
import useTeacherStudentDropoutRisks from "@/features/dashboard/hooks/useTeacherStudentDropoutRisks";
import { getCourseEnrolledStudents } from "@/services/academic.service";
import type { CourseEnrolledStudent } from "@/types/course";

interface TeacherCourseDropoutRiskProps {
  courseId: string;
}

export default function TeacherCourseDropoutRisk({
  courseId,
}: TeacherCourseDropoutRiskProps) {
  const [enrolledStudents, setEnrolledStudents] = useState<
    CourseEnrolledStudent[]
  >([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingStudents(true);

    getCourseEnrolledStudents(courseId)
      .then((students) => {
        if (isMounted) {
          setEnrolledStudents(students.filter((student) => student.isEnrolled));
        }
      })
      .catch(() => {
        if (isMounted) {
          setEnrolledStudents([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingStudents(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const studentDropoutRisks = useTeacherStudentDropoutRisks(enrolledStudents);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <Heading as="h4" className="text-gray-900">
          Riesgo de deserción por estudiante
        </Heading>
        <Text variant="small" className="mt-2 text-gray-600">
          Estimación por cada estudiante matriculado en esta materia.
        </Text>
        <Text variant="caption" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
          Estimación preliminar con datos de ejemplo, mientras se define cómo se
          calculará el riesgo en el colegio. No la uses para tomar decisiones sobre
          un estudiante.
        </Text>
      </div>

      {isLoadingStudents ? (
        <Text variant="small" className="text-gray-500">
          Cargando estudiantes…
        </Text>
      ) : enrolledStudents.length === 0 ? (
        <Text variant="small" className="text-gray-500">
          No hay estudiantes matriculados en esta materia.
        </Text>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {enrolledStudents.map((student) => {
            const displayName =
              [student.user.firstName, student.user.lastName]
                .filter(Boolean)
                .join(" ") || student.user.email;

            return (
              <DropoutRiskCard
                key={student.user.id}
                estimate={studentDropoutRisks.data[student.user.id] ?? null}
                isLoading={studentDropoutRisks.isLoading}
                title={displayName}
                subtitle={student.user.email}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
