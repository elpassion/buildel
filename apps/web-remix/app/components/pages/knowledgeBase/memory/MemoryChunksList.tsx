import React from 'react';

import type { IMemoryChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';

interface MemoryChunksListProps {
  items: IMemoryChunk[];
}

export const MemoryChunksList: React.FC<MemoryChunksListProps> = ({
  items,
}) => {
  return (
    <ItemList
      className="max-w-full"
      itemClassName="py-3 border-b border-neutral-800 max-w-full"
      items={items}
      emptyText={<EmptyMessage>There are no chunks yet...</EmptyMessage>}
      renderItem={(item) => <MemoryChunksListItem data={item} />}
    />
  );
};

interface MemoryChunksListItemProps {
  data: IMemoryChunk;
}

export const MemoryChunksListItem: React.FC<MemoryChunksListItemProps> = ({
  data,
}) => {
  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground">id: {data.id}</p>
      <p className="font-bold">{data.keywords.join(' - ')}</p>

      <pre className="text-sm break-words whitespace-break-spaces">
        {data.content.trim()}
      </pre>

      <div className="mt-2 flex justify-end">
        <p
          className={cn('text-sm text-muted-foreground shrink-0', {
            hidden: !data.pages.length,
          })}
        >
          Page: {data.pages.join(', ')}
        </p>
      </div>
    </div>
  );
};
