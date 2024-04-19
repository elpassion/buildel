import React from "react";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { IKnowledgeBaseSearchChunk } from "~/api/knowledgeBase/knowledgeApi.contracts";

interface KnowledgeBaseSearchListProps {
  items: IKnowledgeBaseSearchChunk[];
  query?: string;
}

export const KnowledgeBaseSearchList: React.FC<
  KnowledgeBaseSearchListProps
> = ({ items, query }) => {
  const hasNoChunks = !!query && items.length === 0;

  return (
    <ItemList
      items={items}
      emptyText={
        hasNoChunks && (
          <EmptyMessage>No answers found in knowledge base...</EmptyMessage>
        )
      }
      className="flex flex-col gap-2"
      renderItem={(item) => <KnowledgeBaseSearchListItem item={item} />}
    />
  );
};

interface KnowledgeBaseSearchListItemProps {
  item: IKnowledgeBaseSearchChunk;
}

function KnowledgeBaseSearchListItem({
  item,
}: KnowledgeBaseSearchListItemProps) {
  return (
    <article className="p-3 bg-neutral-850 rounded-lg text-sm">
      <p className="text-neutral-100">{item.content}</p>

      {/*<div className="mt-1 flex gap-2 justify-between">*/}
      {/*  <p className="font-bold text-neutral-100">{item.file_name}</p>*/}
      {/*</div>*/}
    </article>
  );
}
