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
  const isClickable = !!onClick && !isDeleteMode && !course.isPendingSync;

  const handleCardClick = () => {
    if (!isClickable) {
      return;
    }

    onClick(course.id);
  };

  // Con métricas el periodo ya se muestra arriba; sin docente que mostrar el
  // desplegable quedaría vacío, así que no se ofrece.
  const hasDetails = showTeacherDetails || !metrics;

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

      <div className="mt-5 space-y-4">
        <div className="space-y-3">
          <Heading as="h5" className="text-gray-900">
            {course.name}
          </Heading>

          {!metrics ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                Promedio {averageLabel}
              </span>
            </div>
          ) : null}
        </div>

        {metrics ? (
          <dl className="divide-y divide-gray-100 text-sm">
            {[
              ["Promedio", metrics.averageLabel],
              ["Estudiantes", String(metrics.enrolledCount)],
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
        ) : null}

        {hasDetails ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowDetails((current) => !current);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
          >
            <Text variant="small" className="font-semibold text-gray-800">
              Detalles académicos
            </Text>
            {showDetails ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
        ) : null}

        {hasDetails && showDetails ? (
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
                  Periodo
                </Text>
                <Text variant="small" className="mt-1 text-gray-800">
                  {course.semester}
                </Text>
              </div>
            ) : null}

          </div>
        ) : null}

        {!metrics ? (
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
        ) : null}
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
