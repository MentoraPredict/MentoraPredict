import type { ReactNode } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { ComparativeMetrics } from "@/features/students/mocks/coursePerformanceExtras.mock";

interface ComparativeMetricsPanelProps {
  metrics: ComparativeMetrics | null;
  isLoading: boolean;
}

function Row({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0">
      <Text variant="small" className="text-gray-600">
        {label}
      </Text>
      <div className="flex items-center gap-2">
        <Text variant="small" className="font-semibold text-gray-900">
          {value}
        </Text>
        {trailing}
      </div>
    </div>
  );
}

export default function ComparativeMetricsPanel({
  metrics,
  isLoading,
}: ComparativeMetricsPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="mb-3 text-gray-900">
        Comparativo conmigo mismo
      </Heading>

      {isLoading || !metrics ? (
        <Text variant="small" className="text-gray-400">
          Calculando comparativo…
        </Text>
      ) : (
        <div>
          <Row label="Promedio actual" value={metrics.currentAverage.toFixed(2)} />
          <Row
            label="Promedio anterior"
            value={metrics.previousAverage !== null ? metrics.previousAverage.toFixed(2) : "--"}
            trailing={
              metrics.delta !== null ? (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    metrics.delta >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {metrics.delta >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                  {metrics.delta >= 0 ? "+" : ""}
                  {metrics.delta.toFixed(2)}
                </span>
              ) : null
            }
          />
          <Row label="Mejor promedio del curso" value={metrics.bestAverageInCourse.toFixed(2)} />
          <Row label="Peor promedio del curso" value={metrics.worstAverageInCourse.toFixed(2)} />
        </div>
      )}
    </section>
  );
}
