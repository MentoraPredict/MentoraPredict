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
  HIGH: {
    label: "Muchos alumnos en riesgo",
    className: "bg-red-700 text-white",
  },
  MEDIUM: {
    label: "Algunos estudiantes están en riesgo",
    className: "bg-orange-500 text-white",
  },
  LOW: {
    label: "Casi nadie en riesgo",
    className: "bg-green-700 text-white",
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
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                ${config.className}
            `}
    >
      {label ?? config.label}
    </span>
  );
}
