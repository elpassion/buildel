import React from 'react';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '~/components/ui/card';

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
    <Card>
      <CardHeader>
        {item.keywords.length ? (
          <CardDescription>{item.keywords.join(' - ')}</CardDescription>
        ) : (
          ''
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-foreground">
          {item.content}
        </CardDescription>

        <div className="mt-2 flex gap-2 justify-between">
          <CardDescription>{item.file_name}</CardDescription>

          <CardDescription>
            Score: {(item.similarity * 100).toFixed(0)}%
          </CardDescription>
        </div>
        <CardDescription className="mt-2">
          Page: {item.pages.join(', ')}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
