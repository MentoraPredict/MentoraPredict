import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import CourseImagePlaceholder from "@/features/courses/components/CourseImagePlaceholder";
import CourseRiskBadge from "@/features/courses/components/CourseRiskBadge";

import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  isDeleteMode?: boolean;
  isDeleting?: boolean;
  showTeacherDetails?: boolean;
  metrics?: {
    averageLabel: string;
    enrolledCount: number;
  };
  onClick?: (courseId: string) => void;
  onSecondaryAction?: (courseId: string) => void;
  secondaryActionLabel?: string;
  onDelete?: (courseId: string) => void;
  onCancelDelete?: () => void;
}

export default function CourseCard({
  course,
  isDeleteMode = false,
  isDeleting = false,
  showTeacherDetails = true,
  metrics,
  onClick,
  onSecondaryAction,
  secondaryActionLabel = "Accion",
  onDelete,
  onCancelDelete,
}: CourseCardProps) {
  const isClickable = !!onClick && !isDeleteMode && !course.isPendingSync;

  const handleCardClick = () => {
    if (!isClickable) {
      return;
    }

    onClick(course.id);
  };

  const averageLabel =
    typeof course.currentAverage === "number"
      ? `${course.currentAverage.toFixed(2)} / 10`
      : "Sin promedio";

  return (
    <MotionCard
      as="article"
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (isClickable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.(course.id);
        }
      }}
      className={`
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
                hover:shadow-md
                ${isClickable ? "cursor-pointer" : ""}
            `}
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
                disabled={isDeleting}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(course.id);
                }}
                className="bg-red-700 px-4 py-2 text-sm hover:bg-red-800"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  onCancelDelete?.();
                }}
                className="px-4 py-2 text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CourseImagePlaceholder
        imageUrl={course.imageUrl}
        alt={course.name}
        overlayBadge={
          course.isPendingSync ? (
            <span className="inline-flex items-center justify-center rounded bg-amber-500/90 px-2 py-1 text-[11px] font-bold uppercase text-white backdrop-blur-sm">
              Pendiente
            </span>
          ) : (
            <CourseRiskBadge
              riskLevel={course.riskLevel}
              label={course.riskLabel}
            />
          )
        }
      />

      <div className="mt-5">
        <Heading as="h5" className="text-gray-900">
          {course.name}
        </Heading>

        <dl className="mt-3 divide-y divide-gray-100 text-sm">
          {[
            metrics ? ["Promedio", metrics.averageLabel] : ["Promedio", averageLabel],
            ...(metrics ? [["Estudiantes", String(metrics.enrolledCount)]] : []),
            ...(!metrics && showTeacherDetails
              ? [["Docente", course.teacherName]]
              : []),
            ["Periodo", course.semester],
            ["Descripción", course.description],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 py-2">
              <dt className="shrink-0 text-gray-500">{label}</dt>
              <dd
                className={`min-w-0 text-right text-gray-900 ${
                  label === "Descripción"
                    ? "line-clamp-3 text-gray-600"
                    : "font-semibold"
                }`}
              >
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-auto flex flex-wrap justify-center gap-3 pt-6">
        {onSecondaryAction ? (
          <Button
            type="button"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              onSecondaryAction(course.id);
            }}
            className="px-4 py-2 text-sm"
          >
            {secondaryActionLabel}
          </Button>
        ) : null}
      </div>
    </MotionCard>
  );
}
