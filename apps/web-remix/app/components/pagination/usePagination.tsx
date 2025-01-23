import { useState } from 'react';

export interface Pagination {
  page: number;
  per_page: number;
  totalItems: number;
  totalPages: number;
  search: string;
  sort?: string;
}

export interface PaginationQueryParams {
  page: number;
  per_page: number;
  search: string;
  sort?: string;
}

export const DEFAULT_PAGINATION: Pagination = {
  page: 0,
  per_page: 20,
  search: '',
  totalItems: 0,
  totalPages: 0,
  sort: undefined,
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

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
    ...pagination,
    changeSearch,
    goToNext,
    goToPrev,
    goToPage,
    hasNextPage: pagination.totalPages - 1 > pagination.page,
  };
};

export function getParamsPagination(
  params: URLSearchParams,
  defaults?: Partial<typeof DEFAULT_PAGINATION>,
) {
  const defaultPagination = { ...DEFAULT_PAGINATION, ...defaults };

  return {
    page: Number(params.get('page')) || defaultPagination.page,
    per_page: Number(params.get('per_page')) || defaultPagination.per_page,
    search: params.get('search') || defaultPagination.search,
    sort: params.get('sort') || defaultPagination.sort,
  };
}
