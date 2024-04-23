import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { routes } from "~/utils/routes.utils";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IMemoryChunk } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { LoadMoreButton } from "~/components/pagination/LoadMoreButton";
import { useInfiniteFetch } from "~/components/pagination/useInfiniteFetch";
import { MemoryChunksList } from "./MemoryChunksList";
import { loader } from "./loader.server";

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
    <section className="w-full">
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
