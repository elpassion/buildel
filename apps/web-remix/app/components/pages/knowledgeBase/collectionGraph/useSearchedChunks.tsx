import { useEffect, useRef, useState } from 'react';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseSearchChunkResponse } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { buildUrlWithParams } from '~/utils/url';

type UseRelatedChunksArgs = {
  organizationId: string | number;
  collectionId: string | number;
  searchParams: Record<string, any>;
};

export const useSearchedChunks = ({
  searchParams,
  organizationId,
  collectionId,
}: UseRelatedChunksArgs) => {
  const abortController = useRef<AbortController | null>(null);
  const [searchChunks, setSearchChunks] = useState<IKnowledgeBaseSearchChunk[]>(
    [],
  );

  const fetchSearchChunks = async (params: Record<string, any>) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const url = buildUrlWithParams(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/search`,
        params,
      );
      const res = await fetch(url, { signal: abortController.current.signal });

      if (!res.ok) throw new Error('Failed to fetch search chunks');

      const searched = KnowledgeBaseSearchChunkResponse.parse(await res.json());

      setSearchChunks(searched.data);
    } catch (error) {
      console.log(error);
    } finally {
      abortController.current = null;
    }
  };

  useEffect(() => {
    if (!searchParams.query) return setSearchChunks([]);
    fetchSearchChunks(searchParams);
  }, [searchParams]);

  return { searchChunks };
};
