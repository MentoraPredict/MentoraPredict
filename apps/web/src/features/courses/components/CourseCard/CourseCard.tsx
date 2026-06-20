import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseImagePlaceholder from "@/features/courses/components/CourseImagePlaceholder";
import CourseRiskBadge from "@/features/courses/components/CourseRiskBadge";

import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <article
      className="
                flex
                h-full
                flex-col
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
            "
    >
      <CourseImagePlaceholder imageUrl={course.imageUrl} alt={course.name} />

      <div className="mt-5 space-y-4">
        <div>
          <Text
            variant="caption"
            className="
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-gray-600
                        "
          >
            Nombre del docente
          </Text>

          <Heading as="h5" className="mt-1 text-gray-900">
            {course.teacherName}
          </Heading>
        </div>

        <div>
          <Text
            variant="caption"
            className="
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-gray-600
                        "
          >
            Semestre
          </Text>

          <Text variant="small" className="mt-1 text-gray-700">
            {course.semester}
          </Text>
        </div>

        <div>
          <Text
            variant="caption"
            className="
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-gray-600
                        "
          >
            Descripción de la materia
          </Text>

          <Text
            variant="small"
            className="
                            mt-1
                            line-clamp-3
                            text-gray-600
                        "
          >
            {course.description}
          </Text>
        </div>
      </div>

      <div className="mt-auto flex justify-center pt-6">
        <CourseRiskBadge riskLevel={course.riskLevel} />
      </div>
    </article>
  );
}
