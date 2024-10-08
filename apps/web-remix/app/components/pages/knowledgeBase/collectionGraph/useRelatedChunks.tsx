import { useEffect, useRef, useState } from 'react';

import { MemoryNodeRelatedResponse } from '~/api/knowledgeBase/knowledgeApi.contracts';
import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';

type UseRelatedChunksArgs = {
  organizationId: string | number;
  collectionId: string | number;
  activeChunk: IMemoryNode | null;
  onError?: (err: unknown) => void;
};

export const useRelatedChunks = ({
  activeChunk,
  organizationId,
  collectionId,
  onError,
}: UseRelatedChunksArgs) => {
  const abortController = useRef<AbortController | null>(null);
  const [relatedNeighbours, setRelatedNeighbours] = useState<string[]>([]);

  const fetchRelatedNeighbours = async (chunk: IMemoryNode) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/graphs/related?chunk_id=${chunk.id}&limit=5`,
        { signal: abortController.current.signal },
      );

      if (!res.ok) throw new Error('Failed to fetch related neighbours');

      const related = MemoryNodeRelatedResponse.parse(await res.json());
      setRelatedNeighbours(related.chunks);
    } catch (err) {
      if (!(err instanceof DOMException)) {
        onError?.(err);
        setRelatedNeighbours([]);
      }
    } finally {
      abortController.current = null;
    }
  };

  useEffect(() => {
    if (!activeChunk) return setRelatedNeighbours([]);

    fetchRelatedNeighbours(activeChunk);
  }, [activeChunk?.id]);

  return { neighbors: relatedNeighbours };
};
