import Text from "@/components/atoms/Text";

interface StudentMetricCardProps {
  label: string;
  value: number;
  suffix: string;
  max?: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}

export default function StudentMetricCard({
  label,
  value,
  suffix,
  max = 100,
  min = 0,
  step = 1,
  onChange,
}: StudentMetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Text variant="small" className="font-semibold text-gray-900">
          {label}
        </Text>

        <Text variant="body" className="font-bold text-blue-700">
          {value} {suffix}
        </Text>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="mp-slider w-full"
      />

      <div className="mt-1 flex items-center justify-between">
        <Text variant="caption" className="text-gray-400">
          {min} {suffix}
        </Text>
        <Text variant="caption" className="text-gray-400">
          {max} {suffix}
        </Text>
      </div>
    </div>
  );
}
