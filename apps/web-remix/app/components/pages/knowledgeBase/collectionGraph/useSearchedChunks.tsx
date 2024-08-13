import { useEffect, useRef, useState } from 'react';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseSearchChunkResponse } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { buildUrlWithParams } from '~/utils/url';

type UseRelatedChunksArgs = {
  organizationId: string | number;
  collectionId: string | number;
  searchParams: Record<string, any>;
  onError?: (err: unknown) => void;
};

export const useSearchedChunks = ({
  searchParams,
  organizationId,
  collectionId,
  onError,
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
    } catch (err) {
      if (!(err instanceof DOMException)) {
        onError?.(err);
        setSearchChunks([]);
      }
    } finally {
      abortController.current = null;
    }
  };

  useEffect(() => {
    if (!searchParams.query) return setSearchChunks([]);
    fetchSearchChunks(searchParams);
  }, [JSON.stringify(searchParams)]);

  return { searchChunks };
};
