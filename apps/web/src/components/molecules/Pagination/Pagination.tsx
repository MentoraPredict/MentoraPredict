import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Text from "@/components/atoms/Text";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getVisiblePages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  itemLabel,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const navigationButtonClass =
    "inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700";

  return (
    <nav
      aria-label={`Paginación de ${itemLabel}`}
      className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:flex-row sm:px-6"
    >
      <Text variant="small" className="text-center text-gray-600 sm:text-left">
        Mostrando {firstItem}–{lastItem} de {totalItems} {itemLabel}
      </Text>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            className={navigationButtonClass}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Ir a la página anterior"
          >
            <FiChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {visiblePages.map((page) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                  page === currentPage
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Ir a la página ${page}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span
                key={page}
                className="flex h-10 min-w-6 items-center justify-center text-gray-400"
                aria-hidden="true"
              >
                …
              </span>
            )
          )}

          <button
            type="button"
            className={navigationButtonClass}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Ir a la página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
