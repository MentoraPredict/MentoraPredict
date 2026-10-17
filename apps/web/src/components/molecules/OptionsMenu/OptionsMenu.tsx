import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiMoreVertical } from "react-icons/fi";

export interface OptionsMenuItem {
  label: string;
  icon?: ReactNode;
  /** `danger` resalta acciones destructivas, como eliminar. */
  tone?: "default" | "danger";
  disabled?: boolean;
  onSelect: () => void;
}

interface OptionsMenuProps {
  items: OptionsMenuItem[];
  ariaLabel?: string;
}

/** Botón de tres puntos que despliega acciones secundarias. */
export default function OptionsMenu({
  items,
  ariaLabel = "Opciones",
}: OptionsMenuProps) {
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
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        <FiMoreVertical size={16} aria-hidden="true" />
        Opciones
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 top-12 z-[110] w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                item.tone === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
