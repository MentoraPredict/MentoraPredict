import { FiSearch } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  searchLabel?: string;
  clearLabel?: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}

export default function SearchBar({
  value,
  placeholder = "Buscar...",
  searchLabel = "Buscar",
  clearLabel = "Cancelar",
  onChange,
  onSearch,
  onClear,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <FiSearch
          size={18}
          className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                    "
        />

        <Input
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className="pl-11"
        />
      </div>

      <Button type="button" onClick={onSearch} className="md:min-w-28">
        {searchLabel}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        className="md:min-w-28"
      >
        {clearLabel}
      </Button>
    </div>
  );
}
