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
                                ? "bg-amber-400 text-white"
                                : "text-gray-600 hover:bg-gray-100"
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
