import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { CourseProgressPoint } from "@/types/course";

interface CourseProgressChartProps {
  data: CourseProgressPoint[];
  title?: string;
  subtitle?: string;
}

export default function CourseProgressChart({
  data,
  title = "Progreso",
  subtitle = "Promedio general del curso por semana",
}: CourseProgressChartProps) {
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Heading as="h4" className="text-gray-900">
            {title}
          </Heading>

          <Text variant="caption" className="mt-1">
            {subtitle}
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-700" />
            <Text variant="caption">Actual</Text>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400" />
            <Text variant="caption">Proyección</Text>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="week" tickLine={false} axisLine={false} />

            <YAxis domain={[0, 20]} tickLine={false} axisLine={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-primary-500)"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="projection"
              stroke="var(--color-tertiary-500)"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Text
        variant="caption"
        className="
                    mt-2
                    text-center
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-gray-600
                "
      >
        Semanas / Tiempo
      </Text>
    </section>
  );
}
