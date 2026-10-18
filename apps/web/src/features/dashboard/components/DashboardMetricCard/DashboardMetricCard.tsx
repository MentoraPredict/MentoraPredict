import type { IconType } from "react-icons";

import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

export type DashboardMetricTone = "success" | "warning" | "danger" | "neutral";

export const dashboardMetricToneStyles: Record<DashboardMetricTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-gray-200 bg-gray-50 text-gray-700",
};

/** Franja lateral y color del valor según el tono. */
const toneAccent: Record<DashboardMetricTone, { bar: string; value: string }> = {
  success: { bar: "bg-emerald-500", value: "text-emerald-700" },
  warning: { bar: "bg-amber-500", value: "text-amber-700" },
  danger: { bar: "bg-red-500", value: "text-red-700" },
  neutral: { bar: "bg-blue-600", value: "text-gray-900" },
};

export interface DashboardMetric {
  label: string;
  value: string;
  hint?: string;
  icon?: IconType;
  tone: DashboardMetricTone;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function DashboardMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
  isLoading = false,
}: DashboardMetric) {
  const accent = toneAccent[tone];

  return (
    <MotionCard
      as="article"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      className={`relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white py-5 pl-7 pr-5 text-left shadow-sm transition hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`}
      />

      <div className="flex items-start justify-between gap-3">
        <Text variant="caption" className="font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </Text>
        {Icon ? <Icon size={18} className="shrink-0 text-gray-400" /> : null}
      </div>

      <p className={`mt-2 text-3xl font-bold leading-tight ${accent.value}`}>
        {isLoading ? "…" : value}
      </p>

      {hint ? (
        <Text variant="small" className="mt-2 text-gray-500">
          {hint}
        </Text>
      ) : null}
    </MotionCard>
  );
}
