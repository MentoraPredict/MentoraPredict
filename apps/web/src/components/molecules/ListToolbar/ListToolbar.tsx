import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronDown, FiFilter, FiLayers, FiSearch, FiX } from "react-icons/fi";

import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";

export interface ListToolbarOption {
  value: string;
  label: string;
}

export interface ListToolbarFilter {
  id: string;
  label: string;
  value: string;
  /** Texto de la opción vacía, por ejemplo «Todos los estados». */
  allLabel: string;
  options: ListToolbarOption[];
  onChange: (value: string) => void;
}

export interface ListToolbarGroup {
  value: string;
  options: ListToolbarOption[];
  onChange: (value: string) => void;
}

interface ListToolbarProps {
  search: string;
  searchPlaceholder: string;
  searchLabel?: string;
  onSearchChange: (value: string) => void;
  filters?: ListToolbarFilter[];
  group?: ListToolbarGroup;
  /** Limpia búsqueda, filtros y agrupación. */
  onClear?: () => void;
  /** Contenido extra a la derecha (por ejemplo, un botón de crear). */
  actions?: ReactNode;
}

interface ToolbarPopoverProps {
  label: string;
  icon: ReactNode;
  activeCount: number;
  children: ReactNode;
}

function ToolbarPopover({
  label,
  icon,
  activeCount,
  children,
}: ToolbarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
          activeCount > 0
            ? "border-blue-300 bg-blue-50 text-blue-800"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {icon}
        {label}
        {activeCount > 0 ? (
          <span className="rounded-full bg-blue-700 px-2 text-xs font-semibold text-white">
            {activeCount}
          </span>
        ) : null}
        <FiChevronDown size={14} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-14 z-[110] w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Barra de búsqueda de los listados: campo de texto con los botones
 * «Filtros» y «Agrupar», para que todas las pantallas se usen igual.
 */
export default function ListToolbar({
  search,
  searchPlaceholder,
  searchLabel,
  onSearchChange,
  filters = [],
  group,
  onClear,
  actions,
}: ListToolbarProps) {
  const activeFilters = filters.filter((filter) => filter.value).length;
  const hasActive = Boolean(search.trim()) || activeFilters > 0 || Boolean(group?.value);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1">
        <FiSearch
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          placeholder={searchPlaceholder}
          aria-label={searchLabel ?? searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-11"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToolbarPopover
          label="Filtros"
          icon={<FiFilter size={15} aria-hidden="true" />}
          activeCount={activeFilters}
        >
          {filters.length === 0 ? (
            <p className="text-sm text-gray-500">No hay filtros disponibles.</p>
          ) : (
            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.id}>
                  <Label
                    htmlFor={`filter-${filter.id}`}
                    className="mb-1 block text-xs font-semibold text-gray-600"
                  >
                    {filter.label}
                  </Label>
                  <Select
                    id={`filter-${filter.id}`}
                    value={filter.value}
                    onChange={(event) => filter.onChange(event.target.value)}
                  >
                    <option value="">{filter.allLabel}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          )}
        </ToolbarPopover>

        <ToolbarPopover
          label="Agrupar"
          icon={<FiLayers size={15} aria-hidden="true" />}
          activeCount={group?.value ? 1 : 0}
        >
          {!group || group.options.length === 0 ? (
            <p className="text-sm text-gray-500">No hay agrupaciones disponibles.</p>
          ) : (
            <div role="radiogroup" aria-label="Agrupar por" className="space-y-1">
              {[{ value: "", label: "Sin agrupar" }, ...group.options].map(
                (option) => (
                  <label
                    key={option.value || "none"}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="list-toolbar-group"
                      checked={group.value === option.value}
                      onChange={() => group.onChange(option.value)}
                    />
                    {option.label}
                  </label>
                ),
              )}
            </div>
          )}
        </ToolbarPopover>

        {onClear ? (
          <button
            type="button"
            disabled={!hasActive}
            onClick={onClear}
            className="inline-flex h-12 items-center gap-1 rounded-xl px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiX size={15} aria-hidden="true" />
            Limpiar
          </button>
        ) : null}

        {actions}
      </div>
    </div>
  );
}