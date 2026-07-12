import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Text from "@/components/atoms/Text";
import AdminTemplate from "@/components/templates/AdminTemplate";
import AdminCourseStudents from "@/features/admin/components/AdminCourseStudents";
import useAdminCourses from "@/features/admin/hooks/useAdminCourses";

export default function AdminCourseStudentsPage() {
  const { courseId } = useParams();
  const { courses, isLoading, error } = useAdminCourses();

  const course = useMemo(
    () => courses.find((item) => item.id === courseId),
    [courses, courseId]
  );

  return (
    <AdminTemplate>
      {isLoading ? (
        <div className="py-12 text-center">
          <Text variant="small">Cargando curso...</Text>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : course ? (
        <AdminCourseStudents course={course} />
      ) : (
        <div className="py-12 text-center">
          <Text variant="small">No se encontró el curso seleccionado.</Text>
        </div>
      )}
    </AdminTemplate>
  );
}
