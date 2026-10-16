import { FiCheckSquare, FiFileText, FiFolder } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type {
  UpcomingActivity,
  UpcomingActivityType,
} from "@/features/students/mocks/coursePerformanceExtras.mock";

interface UpcomingActivitiesPanelProps {
  activities: UpcomingActivity[] | null;
  isLoading: boolean;
}

const TYPE_ICONS: Record<UpcomingActivityType, typeof FiFileText> = {
  TASK: FiFileText,
  QUIZ: FiCheckSquare,
  PROJECT: FiFolder,
};

const STATUS_LABELS: Record<UpcomingActivity["status"], string> = {
  PENDING: "Pendiente",
  NOT_STARTED: "No iniciada",
};

const STATUS_TONES: Record<UpcomingActivity["status"], "amber" | "neutral"> = {
  PENDING: "amber",
  NOT_STARTED: "neutral",
};

function formatDueDate(dueInDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dueInDays);
  return date.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function UpcomingActivitiesPanel({
  activities,
  isLoading,
}: UpcomingActivitiesPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="mb-5 text-gray-900">
        Mis próximas actividades
      </Heading>

      {isLoading || !activities ? (
        <Text variant="small" className="text-gray-400">
          Cargando actividades…
        </Text>
      ) : activities.length === 0 ? (
        <Text variant="small" className="text-gray-500">
          No hay actividades próximas registradas.
        </Text>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = TYPE_ICONS[activity.type];
            const tone = STATUS_TONES[activity.status];

            return (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500">
                    <Icon size={16} />
                  </div>
                  <div>
                    <Text variant="small" className="font-medium text-gray-800">
                      {activity.title}
                    </Text>
                    <Text variant="caption" className="mt-0.5 text-gray-500">
                      Entrega: {formatDueDate(activity.dueInDays)}
                    </Text>
                  </div>
                </div>

                <Badge tone={tone} className="shrink-0">
                  {STATUS_LABELS[activity.status]}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
