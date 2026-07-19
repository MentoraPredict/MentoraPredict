import type { CourseRiskLevel } from "@/types/course";

interface CourseRiskBadgeProps {
  riskLevel: CourseRiskLevel;
  label?: string;
}

const riskConfig: Record<
  CourseRiskLevel,
  {
    label: string;
    className: string;
  }
> = {
  CRITICAL: {
    label: "Riesgo crítico de deserción",
    className: "bg-red-900/90 text-white",
  },
  HIGH: {
    label: "Muchos alumnos en riesgo",
    className: "bg-red-700/90 text-white",
  },
  MEDIUM: {
    label: "Algunos estudiantes están en riesgo",
    className: "bg-orange-500/90 text-white",
  },
  LOW: {
    label: "Casi nadie en riesgo",
    className: "bg-green-700/90 text-white",
  },
  UNKNOWN: {
    label: "Sin datos de riesgo",
    className: "bg-gray-200/90 text-gray-700",
  },
};

export default function CourseRiskBadge({
  riskLevel,
  label,
}: CourseRiskBadgeProps) {
  const config = riskConfig[riskLevel];

  return (
    <span
      className={`
                inline-flex
                items-center
                justify-center
                rounded
                px-2
                py-1
                text-[11px]
                font-bold
                uppercase
                backdrop-blur-sm
                ${config.className}
            `}
    >
      {label ?? config.label}
    </span>
  );
}
