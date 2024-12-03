import { useEffect, useMemo, useReducer } from 'react';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FetcherWithComponents } from '@remix-run/react';

import { buildUrlWithParams } from '~/utils/url';

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
  const [state, dispatch] = useReducer(infiniteFetchReducer<T>, {
    ...args.pagination,
    data: { [args.pagination.page]: args?.initialData ?? [] },
  });

  const fetchNextPage = () => {
    if (fetcher.state !== 'idle') return;

    dispatch(goToNext());
  };

  useEffect(() => {
    if (state.data[state.page] !== undefined) return;

    const urlWithParams = buildUrlWithParams(args.loaderUrl, {
      page: state.page,
      per_page: state.per_page,
      search: state.search,
      sort: state.sort,
    });

    fetcher.load(urlWithParams);
  }, [state.page, state.per_page, state.search, state.sort]);

  useEffect(() => {
    const newData = args.dataExtractor(fetcher);

    if (newData && newData.length > 0) {
      dispatch(setData(newData, state.page));
    }
  }, [fetcher.data]);

  const mergedData = useMemo(() => {
    return merge(state.data);
  }, [state.data]);

  const updateData = (cb: (data: T[]) => T[]) => {
    dispatch(setState(cb(merge(state.data))));
  };

  return {
    ...state,
    fetchNextPage,
    hasNextPage: state.totalPages - 1 > state.page,
    isFetchingNextPage: fetcher.state !== 'idle',
    data: mergedData,
    updateData,
  };
};

type Action<T> =
  | {
      type: 'SET_DATA';
      payload: {
        data: T[];
        page: number;
      };
    }
  | {
      type: 'SET_STATE';
      payload: {
        data: T[];
      };
    }
  | {
      type: 'NEXT_PAGE';
    };

type InfiniteFetchReducerState<T = {}> = {
  data: Record<number, T[]>;
  page: number;
  per_page: number;
  totalItems: number;
  totalPages: number;
  search?: string;
  sort?: string;
};

export const infiniteFetchReducer = <T,>(
  state: InfiniteFetchReducerState<T>,
  action: Action<T>,
): InfiniteFetchReducerState<T> => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        page: action.payload.page,
        data: {
          ...state.data,
          [action.payload.page]: action.payload.data,
        },
      };
    case 'SET_STATE':
      const newData = splitByPage(action.payload.data, state.per_page);
      return {
        ...state,
        page: getCurrentPage(newData),
        data: newData,
      };
    case 'NEXT_PAGE':
      return {
        ...state,
        page: state.page + 1,
      };
    default:
      throw new Error('Invalid action');
  }
};

function setData<T>(data: T[], page: number) {
  return {
    type: 'SET_DATA',
    payload: {
      data,
      page,
    },
  } as const;
}

function setState<T>(data: T[]) {
  return {
    type: 'SET_STATE',
    payload: {
      data,
    },
  } as const;
}

function goToNext() {
  return {
    type: 'NEXT_PAGE',
  } as const;
}

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

function getCurrentPage<T>(data: Record<number, T[]>): number {
  return Math.max(...Object.keys(data).map(Number));
}
