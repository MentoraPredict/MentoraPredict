import { FiSettings } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { GradeEvaluationItem } from "@/types/course";

interface GradeEvaluationPanelProps {
  items: GradeEvaluationItem[];
  onChangePercentage: (itemId: string, percentage: number) => void;
}

export default function GradeEvaluationPanel({
  items,
  onChangePercentage,
}: GradeEvaluationPanelProps) {
  const total = items.reduce((sum, item) => sum + item.percentage, 0);

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
      <div className="mb-5 flex items-center justify-between gap-4">
        <Heading as="h5" className="text-gray-900">
          Evaluación de calificaciones
        </Heading>

        <FiSettings className="text-gray-500" />
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="
                            grid
                            grid-cols-[90px_1fr_44px]
                            items-center
                            gap-3
                        "
          >
            <Text variant="caption" className="font-medium text-gray-700">
              {item.label}
            </Text>

            <input
              type="range"
              min={0}
              max={100}
              value={item.percentage}
              onChange={(event) => {
                onChangePercentage(item.id, Number(event.target.value));
              }}
              className="w-full accent-blue-700"
            />

            <Text
              variant="caption"
              className="text-right font-bold text-blue-700"
            >
              {item.percentage}%
            </Text>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Text variant="small">Total</Text>

        <Text
          variant="small"
          className={
            total === 100 ? "font-bold text-blue-700" : "font-bold text-red-700"
          }
        >
          {total}%
        </Text>
      </div>

      {total !== 100 ? (
        <Text variant="caption" className="mt-2 text-right text-red-700">
          La suma de la evaluación debe ser 100%.
        </Text>
      ) : null}
    </section>
  );
}
