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
    <div>
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
        className="w-full accent-blue-700"
      />
    </div>
  );
}
