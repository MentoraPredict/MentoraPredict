import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface StrengthsOpportunitiesPanelProps {
  strengths: string[];
  opportunities: string[];
}

export default function StrengthsOpportunitiesPanel({
  strengths,
  opportunities,
}: StrengthsOpportunitiesPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="mb-5 text-gray-900">
        Fortalezas y oportunidades
      </Heading>

      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-700">
            <FiCheckCircle size={16} />
            <Text variant="caption" className="font-bold uppercase text-emerald-700">
              Fortalezas
            </Text>
          </div>

          {strengths.length === 0 ? (
            <Text variant="small" className="text-emerald-800">
              Aún no hay suficientes datos para identificar fortalezas.
            </Text>
          ) : (
            <ul className="space-y-1.5">
              {strengths.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <Text variant="small" className="text-emerald-800">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-700">
            <FiAlertTriangle size={16} />
            <Text variant="caption" className="font-bold uppercase text-amber-700">
              Oportunidades
            </Text>
          </div>

          {opportunities.length === 0 ? (
            <Text variant="small" className="text-amber-800">
              No se identificaron oportunidades de mejora con los datos actuales.
            </Text>
          ) : (
            <ul className="space-y-1.5">
              {opportunities.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <Text variant="small" className="text-amber-800">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
