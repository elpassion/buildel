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
      {item.keywords.length ? (
        <p className="font-bold text-neutral-100">
          {item.keywords.join(" - ")}
        </p>
      ) : (
        ""
      )}

      <p className="text-neutral-100 mt-2">{item.content}</p>

      <div className="mt-2 flex gap-2 justify-between text-neutral-100 ">
        <p className="font-bold">{item.file_name}</p>

        <p className="font-bold">
          Score: {(item.similarity * 100).toFixed(0)}%
        </p>
      </div>
      <p className="mt-2 font-bold text-neutral-100">
        Page: {item.pages.join(", ")}
      </p>
    </article>
  );
}
