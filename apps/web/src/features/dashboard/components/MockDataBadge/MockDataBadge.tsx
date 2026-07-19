import { FiInfo } from "react-icons/fi";

interface MockDataBadgeProps {
  label?: string;
}

/**
 * Marca visual obligatoria para cualquier KPI mockeado (docs/frontend/
 * dashboard-kpi-proposal.md §2 y §5) — nunca debe verse igual a un dato
 * verificado, para no generar una falsa sensación de precisión.
 */
export default function MockDataBadge({
  label = "Estimación preliminar",
}: MockDataBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200/70">
      <FiInfo size={12} />
      {label}
    </span>
  );
}
