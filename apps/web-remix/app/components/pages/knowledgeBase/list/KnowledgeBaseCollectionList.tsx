import React from 'react';
import { useFetcher } from '@remix-run/react';
import { EllipsisVertical, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import {
  Card,
  CardContent,
  CardContentColumnTitle,
  CardContentColumnValue,
  CardContentColumnWrapper,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { routes } from '~/utils/routes.utils';

import type { IKnowledgeBaseCollection } from '../knowledgeBase.types';

interface KnowledgeBaseCollectionListProps {
  items: IKnowledgeBaseCollection[];
  organizationId: string;
}

export const KnowledgeBaseCollectionList: React.FC<
  KnowledgeBaseCollectionListProps
> = ({ items, organizationId }) => {
  const fetcher = useFetcher();
  const handleDelete = async (collection: IKnowledgeBaseCollection) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit(
          { collectionName: collection.name },
          { method: 'DELETE' },
        ),
      confirmText: 'Delete collection',
      children: (
        <p className="text-sm">
          You are about to delete the "{collection.name}” collection from your
          knowledge base. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      aria-label="Memory collections list"
      className="grid gap-4 grid-cols-1"
      items={items}
      emptyText={
        <EmptyMessage className="block mt-14 md:mt-20">
          There is no Collections yet...
        </EmptyMessage>
      }
      renderItem={(item) => (
        <BasicLink to={routes.collectionFiles(organizationId, item.name)}>
          <KnowledgeBaseCollectionListItem
            data={item}
            onDelete={handleDelete}
            organizationId={organizationId}
          />
        </BasicLink>
      )}
    />
  );
};

interface KnowledgeBaseCollectionListItemProps {
  data: IKnowledgeBaseCollection;
  onDelete: (collection: IKnowledgeBaseCollection) => void;
  organizationId: string;
}

export const KnowledgeBaseCollectionListItem: React.FC<
  KnowledgeBaseCollectionListItemProps
> = ({ data, onDelete }) => {
  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data);
  };

  return (
    <Card>
      <CardHeader className="max-w-full flex-row gap-2 items-center justify-between space-y-0">
        <div>
          <CardTitle className="line-clamp-2">{data.name}</CardTitle>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="text-muted-foreground">
              <IconButton
                variant="ghost"
                size="xs"
                icon={<EllipsisVertical className="w-4 h-4" />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex gap-1 items-center text-red-500"
                onClick={handleDelete}
                title={`Delete Secret: ${data.name}`}
                aria-label={`Delete secret: ${data.name}`}
              >
                <Trash className="w-4 h-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="border-t border-input">
        <div className="grid grid-cols-1 divide-y xl:divide-y-0 xl:grid-cols-[3fr_4fr_2fr_2fr_2fr_2fr_2fr] pt-3">
          <CardContentColumnWrapper>
            <CardContentColumnTitle>Model</CardContentColumnTitle>
            <CardContentColumnValue>
              {data.embeddings.model}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Endpoint</CardContentColumnTitle>
            <CardContentColumnValue
              className="line-clamp-1"
              title={data.embeddings.endpoint}
            >
              {data.embeddings.endpoint}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Api type</CardContentColumnTitle>
            <CardContentColumnValue>
              {data.embeddings.api_type}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Secret name</CardContentColumnTitle>
            <CardContentColumnValue>
              {data.embeddings.secret_name}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Chunk size</CardContentColumnTitle>
            <CardContentColumnValue>{data.chunk_size}</CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Chunk overlap</CardContentColumnTitle>
            <CardContentColumnValue>
              {data.chunk_overlap}
            </CardContentColumnValue>
          </CardContentColumnWrapper>
        </div>
      </CardContent>
    </Card>
  );
};
