import { useEffect, useMemo, useState } from "react";

export default function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey?: unknown
) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  useEffect(() => {
    setRequestedPage(1);
  }, [resetKey]);

  useEffect(() => {
    setRequestedPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  return {
    currentPage,
    paginatedItems,
    totalItems: items.length,
    totalPages,
    setCurrentPage: setRequestedPage,
  };
}
