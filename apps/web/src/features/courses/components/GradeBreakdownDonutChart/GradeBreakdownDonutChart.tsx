import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { MyGradeBreakdown } from "@/types/academic/grading.types";

interface GradeBreakdownDonutChartProps {
  breakdown: MyGradeBreakdown | null;
  isLoading: boolean;
  hasError?: boolean;
}

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#0891b2"];

/**
 * Cómo se forma la nota del periodo: el anillo reparte los pesos de cada
 * componente y la lista muestra el promedio real del estudiante en cada uno.
 */
export default function GradeBreakdownDonutChart({
  breakdown,
  isLoading,
  hasError = false,
}: GradeBreakdownDonutChartProps) {
  const components = breakdown?.components ?? [];
  const chartData = components.map((component, index) => ({
    name: component.name,
    value: component.weight,
    color: COLORS[index % COLORS.length],
  }));
  const decimals = breakdown?.scale.decimals ?? 2;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="text-gray-900">
        Cómo se forma tu nota
      </Heading>
      {breakdown ? (
        <Text variant="caption" className="mb-5 mt-1 text-gray-500">
          {breakdown.period.name}: cada componente pesa un porcentaje de la nota del periodo.
        </Text>
      ) : (
        <div className="mb-5" />
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Text variant="small" className="text-gray-400">
            Calculando…
          </Text>
        </div>
      ) : hasError || components.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Text variant="small" className="text-gray-500">
            Todavía no hay notas para mostrar el desglose.
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
                {breakdown?.periodGrade === null || breakdown?.periodGrade === undefined
                  ? "--"
                  : breakdown.periodGrade.toFixed(decimals)}
              </Text>
              <Text variant="caption" className="text-gray-500">
                Nota del periodo
              </Text>
            </div>
          </div>

          <div className="w-full space-y-2">
            {components.map((component, index) => (
              <div key={component.code} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <Text variant="small" className="truncate text-gray-700">
                    {component.name}
                  </Text>
                  <Text variant="caption" className="shrink-0 text-gray-400">
                    {component.weight}%
                  </Text>
                </div>
                <Text variant="small" className="shrink-0 font-semibold text-gray-900">
                  {component.average === null ? "--" : component.average.toFixed(decimals)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}