import { useMemo, useState } from "react";

export function usePagination(items, pageSizeInit = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeInit);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const setSize = (n) => {
    setPageSize(n);
    setCurrentPage(1);
  };

  const clampPage = (n) => Math.min(totalPages, Math.max(1, n));

  return {
    currentPage,
    pageSize,
    totalPages,
    pageItems,
    setCurrentPage: (n) => setCurrentPage(clampPage(n)),
    setPageSize: setSize,
  };
}
