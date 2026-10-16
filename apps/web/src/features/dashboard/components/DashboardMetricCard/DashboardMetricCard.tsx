import type { IconType } from "react-icons";

import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

export type DashboardMetricTone = "success" | "warning" | "danger" | "neutral";

export const dashboardMetricToneStyles: Record<DashboardMetricTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-gray-200 bg-gray-50 text-gray-700",
};

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
  tone: DashboardMetricTone;
  onClick?: () => void;
  isMocked?: boolean;
  isLoading?: boolean;
}

export default function DashboardMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
  isMocked = false,
  isLoading = false,
}: DashboardMetric) {
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
      className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${dashboardMetricToneStyles[tone]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-current">
          <Icon size={20} />
        </div>
      </div>

      <Text variant="caption" className="font-bold uppercase text-current opacity-75">
        {label}
      </Text>

      <Heading as="h4" className="mt-2 text-current">
        {isLoading ? "…" : value}
      </Heading>

      <Text variant="small" className="mt-2 text-current opacity-80">
        {hint}
      </Text>
    </MotionCard>
  );
}
