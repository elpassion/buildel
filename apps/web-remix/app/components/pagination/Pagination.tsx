import type { ButtonHTMLAttributes } from "react";
import React from "react";
import { useNavigate } from "@remix-run/react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { buildUrlWithParams } from "~/utils/url";
import {
  DEFAULT_PAGINATION
} from "./usePagination";
import type {
  Pagination as UsePaginationProps} from "./usePagination";

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
      <p className="text-sm text-neutral-200">
        page {currentPage} of {totalPages}
      </p>

      <PaginationButton disabled={!hasPreviousPage} onClick={onPrev}>
        <Icon iconName="chevron-left" />
        <span>Previous</span>
      </PaginationButton>

      <PaginationButton disabled={!hasNextPage} onClick={onNext}>
        <span>Next</span>
        <Icon iconName="chevron-right" />
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
        "flex items-center gap-1 px-2 py-1 rounded-lg bg-transparent border border-neutral-800 text-neutral-100 text-sm disabled:bg-neutral-900 disabled:text-neutral-500 hover:text-white hover:bg-neutral-900 transition"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
