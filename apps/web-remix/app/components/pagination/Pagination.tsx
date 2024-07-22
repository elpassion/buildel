import type { ButtonHTMLAttributes } from 'react';
import React from 'react';
import { useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buildUrlWithParams } from '~/utils/url';

import { DEFAULT_PAGINATION } from './usePagination';
import type { Pagination as UsePaginationProps } from './usePagination';

interface PaginationProps {
  pagination: Partial<UsePaginationProps>;
  loaderUrl: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination = DEFAULT_PAGINATION,
  loaderUrl,
}) => {
  const navigate = useNavigate();
  const { totalPages, page } = { ...DEFAULT_PAGINATION, ...pagination };
  const hasNextPage = totalPages > page + 1;
  const hasPreviousPage = page > 0;

  const onNext = () => {
    const urlWithParams = buildUrlWithParams(loaderUrl, {
      page: page + 1,
    });

    navigate(urlWithParams);
  };

  const onPrev = () => {
    const urlWithParams = buildUrlWithParams(loaderUrl, {
      page: page - 1,
    });

    navigate(urlWithParams);
  };

  const currentPage = totalPages > 0 ? page + 1 : 0;

  return (
    <div className="flex gap-2 items-center">
      <p className="text-sm text-muted-foreground">
        page {currentPage} of {totalPages}
      </p>

      <PaginationButton disabled={!hasPreviousPage} onClick={onPrev}>
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </PaginationButton>

      <PaginationButton disabled={!hasNextPage} onClick={onNext}>
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </PaginationButton>
    </div>
  );
};

export function PaginationButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        className,
        'flex items-center h-[30px] gap-1 px-2 py-1 rounded-lg bg-transparent border border-input text-foreground text-sm hover:bg-muted transition disabled:pointer-events-none disabled:opacity-50',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
