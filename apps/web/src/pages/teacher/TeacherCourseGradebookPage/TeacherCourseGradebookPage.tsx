import { useOutletContext } from "react-router-dom";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import TeacherCourseGradebook from "@/features/teachers/components/TeacherCourseGradebook";
import TeacherCourseGradesImport from "@/features/teachers/components/TeacherCourseGradesImport";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseGradebookPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return (
    <div className="space-y-8">
      <TeacherCourseGradebook courseId={course.id} />

      <section>
        <Heading as="h5" className="text-gray-900">
          Importar notas desde un archivo
        </Heading>
        <Text variant="small" className="mb-4 mt-1 text-gray-600">
          Sube un archivo CSV o Excel con las calificaciones de la materia.
        </Text>
        <TeacherCourseGradesImport />
      </section>
    </div>
  );
}