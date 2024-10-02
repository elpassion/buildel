import { useEffect, useMemo, useState } from 'react';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FetcherWithComponents } from '@remix-run/react';

import { buildUrlWithParams } from '~/utils/url';

import { usePagination } from './usePagination';
import type { Pagination } from './usePagination';

interface UseInfiniteFetchProps<T, R> {
  initialData?: T[];
  pagination: Pagination;
  loaderUrl: string;
  dataExtractor: (
    response: FetcherWithComponents<SerializeFrom<R>>,
  ) => undefined | T[];
}

export const useInfiniteFetch = <T, R>(args: UseInfiniteFetchProps<T, R>) => {
  const fetcher = useFetcher<R>();
  const { page, per_page, search, goToNext, hasNextPage } = usePagination(
    args.pagination,
  );

  const [data, setData] = useState<Record<number, T[]>>({
    [page]: args?.initialData ?? [],
  });

  const fetchNextPage = () => {
    if (fetcher.state !== 'idle') return;
    goToNext?.();
  };
  console.log(page, data);
  useEffect(() => {
    if (data[page] !== undefined) return;

    const urlWithParams = buildUrlWithParams(args.loaderUrl, {
      page,
      per_page,
      search,
    });

    fetcher.load(urlWithParams);
  }, [page, per_page, search]);

  useEffect(() => {
    const newData = args.dataExtractor(fetcher);

    if (newData && newData.length > 0) {
      setData((prev) => ({ ...prev, [page]: newData }));
    }
  }, [fetcher.data]);

  const mergedData = useMemo(() => {
    return merge(data);
  }, [data]);

  const updateData = (cb: (data: T[]) => T[]) => {
    setData((prev) => {
      const newData = cb(merge(prev));

      return splitByPage(newData, per_page);
    });
  };

  return {
    page,
    per_page,
    search,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: fetcher.state !== 'idle',
    data: mergedData,
    updateData,
  };
};

function merge<T>(data: Record<number, T[]>): T[] {
  return Object.values(data).reduce(
    (acc, curr) => [...acc, ...curr],
    [] as T[],
  );
}

function splitByPage<T>(data: T[], per_page: number): Record<number, T[]> {
  return data.reduce(
    (acc, curr, index) => {
      const page = Math.floor(index / per_page);

      if (!acc[page]) {
        acc[page] = [];
      }

      acc[page].push(curr);

      return acc;
    },
    {} as Record<number, T[]>,
  );
}
