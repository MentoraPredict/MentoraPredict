import Text from "@/components/atoms/Text";

import type { CourseRiskItem } from "@/types/course";

interface CourseRiskBarsProps {
  items: CourseRiskItem[];
  higherIsBetter?: boolean;
}

function getRiskBarColor(value: number, higherIsBetter: boolean) {
  if (higherIsBetter) {
    if (value >= 80) return "bg-green-700";
    if (value >= 60) return "bg-amber-500";
    return "bg-red-700";
  }

  if (value >= 80) {
    return "bg-red-700";
  }

  if (value >= 60) {
    return "bg-blue-700";
  }

  return "bg-green-700";
}

export default function CourseRiskBars({
  items,
  higherIsBetter = false,
}: CourseRiskBarsProps) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-2 flex items-center justify-between">
            <Text variant="small" className="font-medium text-gray-900">
              {item.label}
            </Text>

            <Text variant="caption" className="font-bold text-red-700">
              {item.value}%
            </Text>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`
                                h-full
                                rounded-full
                ${getRiskBarColor(item.value, higherIsBetter)}
                            `}
              style={{
                width: `${item.value}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
