import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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
  const [showDetails, setShowDetails] = useState(false);
  const isClickable = !!onClick && !isDeleteMode;

  const handleCardClick = () => {
    if (!isClickable) {
      return;
    }

    onClick(course.id);
  };

  const averageLabel =
    typeof course.currentAverage === "number"
      ? `${course.currentAverage.toFixed(2)} / 20`
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

      <CourseImagePlaceholder imageUrl={course.imageUrl} alt={course.name} />

      <div className="mt-5 space-y-4">
        <div className="space-y-3">
          <Heading as="h5" className="text-gray-900">
            {course.name}
          </Heading>

          <div className="flex flex-wrap items-center gap-2">
            <CourseRiskBadge
              riskLevel={course.riskLevel}
              label={course.riskLabel}
            />
            {!metrics ? (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                Promedio {averageLabel}
              </span>
            ) : null}
          </div>
        </div>

        {metrics ? (
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div>
              <Text variant="caption" className="font-bold uppercase text-blue-700">
                Promedio
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {metrics.averageLabel}
              </Text>
            </div>

            <div>
              <Text variant="caption" className="font-bold uppercase text-blue-700">
                Estudiantes
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {metrics.enrolledCount}
              </Text>
            </div>

            <div>
              <Text variant="caption" className="font-bold uppercase text-blue-700">
                Semestre
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {course.semester}
              </Text>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowDetails((current) => !current);
          }}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
        >
          <Text variant="small" className="font-semibold text-gray-800">
            Detalles academicos
          </Text>
          {showDetails ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>

        {showDetails ? (
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
            {showTeacherDetails ? (
              <div>
                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  Docente
                </Text>
                <Text variant="small" className="mt-1 text-gray-800">
                  {course.teacherName}
                </Text>
              </div>
            ) : null}

            {!metrics ? (
              <div>
                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  Semestre
                </Text>
                <Text variant="small" className="mt-1 text-gray-800">
                  {course.semester}
                </Text>
              </div>
            ) : null}

            {course.careerName ? (
              <div>
                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  Carrera
                </Text>
                <Text variant="small" className="mt-1 text-gray-800">
                  {course.careerName}
                </Text>
              </div>
            ) : null}

            {course.credits ? (
              <div>
                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  Creditos
                </Text>
                <Text variant="small" className="mt-1 text-gray-800">
                  {course.credits}
                </Text>
              </div>
            ) : null}
          </div>
        ) : null}

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
