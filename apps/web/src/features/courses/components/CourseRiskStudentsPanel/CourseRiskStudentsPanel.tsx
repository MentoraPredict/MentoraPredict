import Heading from "@/components/atoms/Heading";

import CourseRiskBars from "@/features/courses/components/CourseRiskBars";

import type { CourseRiskItem } from "@/types/course";

interface CourseRiskStudentsPanelProps {
  students: CourseRiskItem[];
}

export default function CourseRiskStudentsPanel({
  students,
}: CourseRiskStudentsPanelProps) {
  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <Heading as="h5" className="mb-6 text-gray-900">
        Estudiantes con alto riesgo de pérdida
      </Heading>

      <CourseRiskBars items={students} />
    </section>
  );
}
