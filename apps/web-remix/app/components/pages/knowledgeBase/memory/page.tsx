import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import type { IMemoryChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';
import { MemoryChunksList } from './MemoryChunksList';

export function CollectionMemory() {
  const { ref: fetchNextRef, inView } = useInView();
  const { organizationId, collectionName, memoryId, chunks, pagination } =
    useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IMemoryChunk, typeof loader>({
      pagination,
      initialData: chunks,
      loaderUrl: routes.collectionMemory(
        organizationId,
        collectionName,
        memoryId,
      ),
      dataExtractor: (response) => response.data?.chunks,
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <section className="w-full max-w-full">
      <MemoryChunksList items={data} />

      <div className="flex justify-center mt-5" ref={fetchNextRef}>
        <LoadMoreButton
          isFetching={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onClick={fetchNextPage}
        />
      </div>
    </section>
  );
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      title: `Memory`,
    },
  ];
};
