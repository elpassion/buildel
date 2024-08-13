import React, { useCallback } from 'react';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';

export function SearchChunksList({
  searchChunks,
  onChunkSelect,
  onMouseOver,
  onMouseLeave,
}: {
  searchChunks: IKnowledgeBaseSearchChunk[];
  onChunkSelect: (id: string) => void;
  onMouseOver: (id: string) => void;
  onMouseLeave: () => void;
}) {
  const onMouseEnter = useCallback((id: string) => {
    onMouseOver(id);
  }, []);

  return (
    searchChunks.length > 0 && (
      <div className="relative top-1 w-full max-w-[350px] max-h-[200px] overflow-y-auto overflow-x-hidden pointer-events-auto bg-white border border-input p-2 rounded-lg flex flex-col">
        {searchChunks.map((chunk) => {
          return (
            <button
              className="hover:bg-muted p-1 rounded-sm text-xs"
              onClick={() => {
                onChunkSelect(chunk.id);
              }}
              onMouseEnter={() => onMouseEnter(chunk.id)}
              onMouseLeave={onMouseLeave}
              key={chunk.id}
            >
              <div className="whitespace-nowrap truncate w-full">
                {chunk.file_name}
              </div>
              <div className="whitespace-nowrap truncate w-full">
                {chunk.keywords.toString()}
              </div>
              <div className="whitespace-nowrap truncate w-full">
                Pages: {chunk.pages.toString()}
              </div>
            </button>
          );
        })}
      </div>
    )
  );
}
