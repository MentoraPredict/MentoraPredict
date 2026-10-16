import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { GradeComponentBreakdown } from "@/features/students/mocks/coursePerformanceExtras.mock";

interface GradeBreakdownDonutChartProps {
  breakdown: GradeComponentBreakdown[] | null;
  average: number;
  isLoading: boolean;
}

const COMPONENT_COLORS: Record<string, string> = {
  tareas: "#2563eb",
  quizzes: "#16a34a",
  parciales: "#f97316",
  proyecto: "#7c3aed",
};

export default function GradeBreakdownDonutChart({
  breakdown,
  average,
  isLoading,
}: GradeBreakdownDonutChartProps) {
  const items = breakdown ?? [];
  const chartData = items.map((item) => ({
    name: item.label,
    value: item.weightPercent,
    color: COMPONENT_COLORS[item.id] ?? "#9ca3af",
  }));

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="mb-5 text-gray-900">
        Desglose de calificaciones
      </Heading>

      {isLoading || items.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <Text variant="small" className="text-gray-400">
            Calculando desglose…
          </Text>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Text variant="body" className="text-2xl font-bold text-gray-900">
                {average.toFixed(2)}
              </Text>
              <Text variant="caption" className="text-gray-500">
                Promedio
              </Text>
            </div>
          </div>

          <div className="w-full space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COMPONENT_COLORS[item.id] ?? "#9ca3af" }}
                  />
                  <Text variant="small" className="text-gray-700">
                    {item.label}
                  </Text>
                  <Text variant="caption" className="text-gray-400">
                    {item.weightPercent}%
                  </Text>
                </div>
                <Text variant="small" className="font-semibold text-gray-900">
                  {item.grade === null ? "--" : item.grade.toFixed(2)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
