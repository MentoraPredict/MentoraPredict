import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseImagePlaceholder from "@/features/courses/components/CourseImagePlaceholder";
import CourseRiskBadge from "@/features/courses/components/CourseRiskBadge";

import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  isDeleteMode?: boolean;
  onDelete?: (courseId: string) => void;
  onCancelDelete?: () => void;
}

export default function CourseCard({
  course,
  isDeleteMode = false,
  onDelete,
  onCancelDelete,
}: CourseCardProps) {
  return (
    <article
      className="
                group
                relative
                flex
                h-full
                flex-col
                overflow-hidden
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
      {isDeleteMode ? (
        <div
          className="
                        absolute
                        inset-0
                        z-20
                        hidden
                        items-center
                        justify-center
                        bg-white/90
                        p-5
                        group-hover:flex
                    "
        >
          <div className="flex flex-col items-center gap-4">
            <Text
              variant="small"
              className="text-center font-semibold text-gray-900"
            >
              ¿Eliminar este curso?
            </Text>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  onDelete?.(course.id);
                }}
                className="bg-red-700 px-4 py-2 text-sm hover:bg-red-800"
              >
                Eliminar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancelDelete}
                className="px-4 py-2 text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CourseImagePlaceholder imageUrl={course.imageUrl} alt={course.name} />

      <div className="mt-5 space-y-4">
        <div>
          <Heading as="h5" className="text-gray-900">
            {course.name}
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
        <CourseRiskBadge
          riskLevel={course.riskLevel}
          label={course.riskLabel}
        />
      </div>
    </article>
  );
}
