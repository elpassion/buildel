import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import type { IMemoryChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { MemoryChunksList } from '~/components/pages/knowledgeBase/memory/MemoryChunksList';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { loaderBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, request }, { fetch }) => {
    assert(params.uuid, 'Missing uuid');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const { page, per_page, search } = getParamsPagination(
      new URL(request.url).searchParams,
    );

    const { data: chunks } = await knowledgeBaseApi.getTemporaryMemory(
      params.uuid,
      { page, per_page, search },
    );

    const totalItems = chunks.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      content: chunks.data.map((item) => ({
        ...item,
        keywords: [] as string[],
      })),
      pagination: { page, per_page, search, totalItems, totalPages },
      uuid: params.uuid,
    });
  })(args);
}

export default function MemoryPage() {
  const { ref: fetchNextRef, inView } = useInView();
  const { content, pagination, uuid } = useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IMemoryChunk, typeof loader>({
      pagination,
      initialData: content,
      loaderUrl: routes.temporaryMemory(uuid),
      dataExtractor: (response) => response.data?.content,
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <main className="max-w-screen-lg mx-auto py-6 px-6">
      {data?.[0]?.file_name ? (
        <h1 className="text-xl font-bold mb-6">{data?.[0]?.file_name}</h1>
      ) : null}

      <MemoryChunksList items={data} />

      <div className="flex justify-center mt-5" ref={fetchNextRef}>
        <LoadMoreButton
          isFetching={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onClick={fetchNextPage}
        />
      </div>
    </main>
  );
}
