import { useState } from "react";

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
}

export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  search: "",
  totalItems: 0,
  totalPages: 0,
};

export const usePagination = (initialPagination?: Partial<Pagination>) => {
  const [pagination, setPagination] = useState({
    ...DEFAULT_PAGINATION,
    ...initialPagination,
  });

  const changeSearch = (search: string) => {
    setPagination((prev) => ({ ...prev, search, page: 1 }));
  };

  const goToNext =
    pagination.totalPages > pagination.page
      ? () => {
          setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      : undefined;

  const goToPrev =
    pagination.page > 0
      ? () => {
          setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      : undefined;

  return {
    ...pagination,
    changeSearch,
    goToNext,
    goToPrev,
    hasNextPage: pagination.totalPages > pagination.page,
  };
};

export function getParamsPagination(params: URLSearchParams) {
  return {
    page: Number(params.get("page")) || DEFAULT_PAGINATION.page,
    limit: Number(params.get("limit")) || DEFAULT_PAGINATION.limit,
    search: params.get("search") || DEFAULT_PAGINATION.search,
  };
}
