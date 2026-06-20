import { FiX } from "react-icons/fi";

import Text from "@/components/atoms/Text";

interface SelectedItemChipProps {
  label: string;
  onRemove?: () => void;
}

export default function SelectedItemChip({
  label,
  onRemove,
}: SelectedItemChipProps) {
  return (
    <span
      className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-blue-700
            "
    >
      <Text variant="caption" className="font-semibold text-blue-700">
        {label}
      </Text>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="
                        rounded-full
                        text-blue-700
                        transition
                        hover:text-blue-900
                    "
        >
          <FiX size={12} />
        </button>
      ) : null}
    </span>
  );
}
