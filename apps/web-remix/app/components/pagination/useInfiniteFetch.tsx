import { useEffect, useMemo, useState } from "react";
import { FetcherWithComponents, useFetcher } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/node";
import { Pagination, usePagination } from "./usePagination";
import { buildUrlWithParams } from "~/utils/url";

interface UseInfiniteFetchProps<T, R> {
  initialData?: T[];
  pagination: Pagination;
  loaderUrl: string;
  dataExtractor: (
    response: FetcherWithComponents<SerializeFrom<R>>
  ) => undefined | T[];
}

export const useInfiniteFetch = <T, R>(args: UseInfiniteFetchProps<T, R>) => {
  const fetcher = useFetcher<R>();
  const { page, per_page, search, goToNext, hasNextPage } = usePagination(
    args.pagination
  );

  const [data, setData] = useState<Record<number, T[]>>({
    [page]: args?.initialData ?? [],
  });

  const fetchNextPage = () => {
    if (fetcher.state !== "idle") return;
    goToNext?.();
  };

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
    return Object.values(data).reduce(
      (acc, curr) => [...acc, ...curr],
      [] as T[]
    );
  }, [data]);

  return {
    page,
    per_page,
    search,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: fetcher.state !== "idle",
    data: mergedData,
  };
};
