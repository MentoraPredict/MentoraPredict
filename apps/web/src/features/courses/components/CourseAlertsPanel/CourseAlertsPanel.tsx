import { FiAlertTriangle } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { CourseAlert } from "@/types/course";

interface CourseAlertsPanelProps {
  alerts: CourseAlert[];
  title?: string;
  emptyMessage?: string;
}

const severityStyles: Record<CourseAlert["severity"], string> = {
  CRITICAL: "border-red-800 bg-red-100 text-red-900",
  HIGH: "border-red-600 bg-red-50 text-red-700",
  MEDIUM: "border-orange-500 bg-orange-50 text-orange-700",
  LOW: "border-gray-400 bg-gray-100 text-gray-700",
};

const severityRank: Record<CourseAlert["severity"], number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default function CourseAlertsPanel({
  alerts,
  title = "Advertencias académicas",
  emptyMessage = "No hay advertencias activas con los datos disponibles.",
}: CourseAlertsPanelProps) {
  const sortedAlerts = [...alerts].sort(
    (left, right) => severityRank[right.severity] - severityRank[left.severity],
  );
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
      <div className="mb-5 flex items-center gap-3">
        <FiAlertTriangle size={22} className="text-red-600" />

        <Heading as="h5" className="text-gray-900">
          {title}
        </Heading>
      </div>

      <div className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <Text variant="small" className="text-gray-600">
            {emptyMessage}
          </Text>
        ) : null}

        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`
                            rounded-xl
                            border-l-4
                            px-4
                            py-3
                            ${severityStyles[alert.severity]}
                        `}
          >
            <Text variant="small" className="text-current">
              {alert.message}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
