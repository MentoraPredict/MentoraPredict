import Text from "@/components/atoms/Text";

interface StudentMetricCardProps {
  label: string;
  value: number;
  suffix: string;
  max?: number;
}

export default function StudentMetricCard({
  label,
  value,
  suffix,
  max = 100,
}: StudentMetricCardProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Text variant="small" className="font-semibold text-gray-900">
          {label}
        </Text>

        <Text variant="body" className="font-bold text-blue-700">
          {value} {suffix}
        </Text>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
