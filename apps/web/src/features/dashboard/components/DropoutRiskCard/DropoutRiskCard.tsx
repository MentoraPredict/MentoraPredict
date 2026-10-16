import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiTrendingDown } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import CourseRiskBars from "@/features/courses/components/CourseRiskBars";
import type { CourseRiskItem } from "@/types/course";

import {
  insufficientDataPresentation,
  riskLevelPresentation,
} from "../../utils/riskLevelPresentation";
import type { DropoutRiskEstimate } from "../../types/dashboard-kpi.types";

interface DropoutRiskCardProps {
  estimate: DropoutRiskEstimate | null;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

export default function DropoutRiskCard({
  estimate,
  isLoading,
  title = "Riesgo de deserción estimado",
  subtitle = "Basado en tendencia, cumplimiento y actividad reciente",
}: DropoutRiskCardProps) {
  const [showFactors, setShowFactors] = useState(false);
  const presentation = estimate
    ? riskLevelPresentation[estimate.level]
    : insufficientDataPresentation;

  const factorItems: CourseRiskItem[] = (estimate?.factors ?? []).map(
    (factor) => ({
      id: factor.key,
      label: factor.label,
      value: factor.normalizedScore,
    })
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <FiTrendingDown size={20} />
          </div>
          <div>
            <Heading as="h4" className="text-gray-900">
              {title}
            </Heading>
            <Text variant="caption" className="text-gray-500">
              {subtitle}
            </Text>
          </div>
        </div>
      </div>

      {isLoading || !estimate ? (
        <Text variant="small" className="text-gray-600">
          Calculando estimación…
        </Text>
      ) : (
        <>
          <div className={`rounded-2xl border px-5 py-4 ${presentation.panelClassName}`}>
            <div className="flex items-baseline justify-between">
              <Text variant="small" className="font-bold">
                {presentation.label}
              </Text>
              <Heading as="h3" className="text-current">
                {estimate.score}
                <span className="text-base font-normal">/100</span>
              </Heading>
            </div>
            {estimate.disclaimer ? (
              <Text variant="caption" className="mt-2 text-current opacity-90">
                {estimate.disclaimer}
              </Text>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setShowFactors((current) => !current)}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            {showFactors ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            {showFactors ? "Ocultar factores" : "Ver factores que lo componen"}
          </button>

          {showFactors ? (
            <div className="mt-4">
              <CourseRiskBars items={factorItems} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
