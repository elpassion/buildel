import { useEffect, useMemo, useRef, useState } from "react";
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
  const prevUrl = useRef(args.loaderUrl);
  const fetcher = useFetcher<R>();
  const { page, per_page, search, goToNext, hasNextPage, goToPage } =
    usePagination(args.pagination);

  const [data, setData] = useState<Record<number, T[]>>({
    [page]: args?.initialData ?? [],
  });

  const clearDate = () => {
    setData([]);
  };

  const fetchNextPage = () => {
    if (fetcher.state !== "idle") return;
    goToNext?.();
  };

  useEffect(() => {
    if (args.loaderUrl !== prevUrl.current) {
      const urlWithParams = buildUrlWithParams(args.loaderUrl, {
        page: 0,
        per_page,
        search,
      });

      fetcher.load(urlWithParams);

      prevUrl.current = args.loaderUrl;

      return;
    }

    if (data[page] !== undefined) return;

    const urlWithParams = buildUrlWithParams(args.loaderUrl, {
      page,
      per_page,
      search,
    });

    fetcher.load(urlWithParams);
  }, [page, per_page, search, args.loaderUrl]);

  useEffect(() => {
    const newData = args.dataExtractor(fetcher);

    if (newData) {
      // @todo fix types
      //@ts-ignore
      if (fetcher.data.pagination.page === 0) {
        //@ts-ignore
        setData({ [fetcher.data.pagination.page]: newData });
        goToPage(0);
      } else {
        setData((prev) => ({ ...prev, [page]: newData }));
      }
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
    isLoading: fetcher.state !== "idle" && mergedData.length === 0,
    data: mergedData,
    clear: clearDate,
  };
};
