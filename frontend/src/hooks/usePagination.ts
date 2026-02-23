import { useState, useMemo, useCallback, useEffect } from 'react';

interface UsePaginationReturn {
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
}

export function usePagination(pageSize = 20): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const safePage = useCallback(
    (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    [totalPages],
  );

  useEffect(() => {
    setPage((p) => Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  return { page, limit: pageSize, offset, totalPages, setPage: safePage, setTotal };
}
