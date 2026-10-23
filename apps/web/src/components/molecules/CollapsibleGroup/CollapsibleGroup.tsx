import { useState, type ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

interface CollapsibleGroupProps {
  label: string;
  count: number;
  /** Abierto desde el inicio; por defecto los grupos arrancan colapsados. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Encabezado de grupo estilo Odoo: «Etiqueta (cantidad)» que abre y cierra su contenido. */
export default function CollapsibleGroup({
  label,
  count,
  defaultOpen = false,
  children,
}: CollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-2 bg-blue-50/60 px-4 py-3 text-left text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
      >
        <FiChevronRight
          size={16}
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        {label} ({count})
      </button>

      {isOpen ? <div className="border-t border-gray-200">{children}</div> : null}
    </section>
  );
}