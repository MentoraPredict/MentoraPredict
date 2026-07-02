import { FiFrown, FiMeh, FiSmile } from "react-icons/fi";

interface RatingScaleOption {
  value: number;
  label: string;
}

interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  options?: RatingScaleOption[];
}

const defaultOptions: RatingScaleOption[] = [
  {
    value: 1,
    label: "Muy bajo",
  },
  {
    value: 2,
    label: "Bajo",
  },
  {
    value: 3,
    label: "Medio",
  },
  {
    value: 4,
    label: "Alto",
  },
  {
    value: 5,
    label: "Muy alto",
  },
];

const optionColors: Record<number, string> = {
  1: "text-red-700 hover:bg-red-50",
  2: "text-orange-600 hover:bg-orange-50",
  3: "text-yellow-500 hover:bg-yellow-50",
  4: "text-green-600 hover:bg-green-50",
  5: "text-blue-700 hover:bg-blue-50",
};

const selectedOptionColors: Record<number, string> = {
  1: "bg-red-700 text-white",
  2: "bg-orange-600 text-white",
  3: "bg-yellow-400 text-white",
  4: "bg-green-600 text-white",
  5: "bg-blue-700 text-white",
};

function getIcon(value: number) {
  if (value <= 2) {
    return <FiFrown size={20} />;
  }

  if (value === 3) {
    return <FiMeh size={20} />;
  }

  return <FiSmile size={20} />;
}

export default function RatingScale({
  value,
  onChange,
  options = defaultOptions,
}: RatingScaleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            onClick={() => {
              onChange(option.value);
            }}
            className={`
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            transition
                            ${
                              isSelected
                                ? selectedOptionColors[option.value]
                                : optionColors[option.value]
                            }
                        `}
          >
            {getIcon(option.value)}
          </button>
        );
      })}
    </div>
  );
}
