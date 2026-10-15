import type { IconType } from "react-icons";

import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import { dashboardMetricToneStyles, type DashboardMetricTone } from "../DashboardMetricCard";

const RING_COLORS: Record<DashboardMetricTone, string> = {
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#9ca3af",
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface CircularGaugeMetric {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
  tone: DashboardMetricTone;
  /** 0-100 — proporción del anillo a rellenar (estilo semáforo por color). */
  percentage: number;
  onClick?: () => void;
  isMocked?: boolean;
  isLoading?: boolean;
}

export default function CircularGaugeCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  percentage,
  onClick,
  isMocked = false,
  isLoading = false,
}: CircularGaugeMetric) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const dashOffset = CIRCUMFERENCE * (1 - clampedPercentage / 100);
  const ringColor = RING_COLORS[tone];

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
      <div className="mb-3 flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-current">
          <Icon size={16} />
        </span>
        <Text variant="caption" className="font-bold uppercase leading-tight text-current opacity-75">
          {label}
        </Text>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={isLoading ? CIRCUMFERENCE : dashOffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-current">{isLoading ? "…" : value}</span>
          </div>
        </div>

        <Text variant="small" className="text-current opacity-80">
          {hint}
        </Text>
      </div>
    </MotionCard>
  );
}
