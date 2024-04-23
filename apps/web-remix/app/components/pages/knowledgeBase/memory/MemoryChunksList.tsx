import React from "react";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { IMemoryChunk } from "~/api/knowledgeBase/knowledgeApi.contracts";

interface MemoryChunksListProps {
  items: IMemoryChunk[];
}

export const MemoryChunksList: React.FC<MemoryChunksListProps> = ({
  items,
}) => {
  return (
    <ItemList
      itemClassName="py-3 border-b border-neutral-800"
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
    <div>
      <p className="font-bold text-neutral-100">{data.keywords.join(" - ")}</p>
      <p className="text-neutral-100 text-sm break-words">{data.content}</p>
    </div>
  );
};
