import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import WasmConfettiBurst, { WasmConfettiTrigger } from "@/components/molecules/WasmConfettiBurst";

import type { CourseProgressPoint } from "@/types/course";
import type { SubjectTrendClassification } from "@/services/course-analytics.service";

interface CourseProgressChartProps {
  data: CourseProgressPoint[];
  title?: string;
  subtitle?: string;
  /** When provided, shows a trend badge and the WASM-powered confetti trigger. */
  classification?: SubjectTrendClassification;
}

const classificationStyles: Record<
  SubjectTrendClassification,
  { label: string; tone: "green" | "neutral" | "red" }
> = {
  ASCENDING: { label: "Tendencia ascendente", tone: "green" },
  STABLE: { label: "Tendencia estable", tone: "neutral" },
  DESCENDING: { label: "Tendencia descendente", tone: "red" },
};

export default function CourseProgressChart({
  data,
  title = "Progreso",
  subtitle = "Promedio general del curso por semana",
  classification,
}: CourseProgressChartProps) {
  const hasProjection = data.some((point) => point.projection !== undefined);
  const [burstKey, setBurstKey] = useState(0);
  const hasAutoBurstRef = useRef(false);

  useEffect(() => {
    if (classification === "ASCENDING" && !hasAutoBurstRef.current) {
      hasAutoBurstRef.current = true;
      setBurstKey((key) => key + 1);
    }
  }, [classification]);

  const tone = classification ? classificationStyles[classification] : null;

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
      {classification ? <WasmConfettiBurst triggerKey={burstKey} /> : null}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading as="h4" className="text-gray-900">
            {title}
          </Heading>

          <Text variant="caption" className="mt-1">
            {subtitle}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {tone ? (
            <div className="flex items-center gap-2">
              <Badge tone={tone.tone}>{tone.label}</Badge>
              <WasmConfettiTrigger onTrigger={() => setBurstKey((key) => key + 1)} />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-700" />
            <Text variant="caption">Actual</Text>
          </div>

          {hasProjection ? (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400" />
              <Text variant="caption">Proyección</Text>
            </div>
          ) : null}
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

            {hasProjection ? (
              <Line
                type="monotone"
                dataKey="projection"
                stroke="var(--color-tertiary-500)"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={false}
              />
            ) : null}
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
