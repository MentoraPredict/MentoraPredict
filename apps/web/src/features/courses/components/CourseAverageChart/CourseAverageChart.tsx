import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface CourseAverageChartProps {
  average: number;
  maxAverage?: number;
  title?: string;
  description?: string;
}

export default function CourseAverageChart({
  average,
  maxAverage = 20,
  title = "Promedio del curso",
  description = "El promedio actual se sitúa por debajo del umbral objetivo esperado para esta etapa.",
}: CourseAverageChartProps) {
  const remaining = Math.max(maxAverage - average, 0);

  const data = [
    {
      name: "Promedio",
      value: average,
    },
    {
      name: "Restante",
      value: remaining,
    },
  ];

  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                text-center
                shadow-sm
            "
    >
      <Heading as="h5" className="text-gray-900">
        {title}
      </Heading>

      <div className="relative mx-auto mt-6 h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={65}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="var(--color-primary-500)" />
              <Cell fill="var(--color-gray-200)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          className="
                        absolute
                        inset-0
                        flex
                        flex-col
                        items-center
                        justify-center
                    "
        >
          <Text variant="body" className="text-4xl font-bold text-blue-700">
            {average}/{maxAverage}
          </Text>

          <Text
            variant="caption"
            className="font-semibold uppercase text-gray-600"
          >
            Bajo rendimiento
          </Text>
        </div>
      </div>

      <Text variant="small" className="mx-auto mt-6 max-w-xs">
        {description}
      </Text>
    </section>
  );
}
