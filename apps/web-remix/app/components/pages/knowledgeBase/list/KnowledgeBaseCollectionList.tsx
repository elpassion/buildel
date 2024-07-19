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
  CardDescription,
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
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      items={items}
      emptyText={<EmptyMessage>There is no Collections yet...</EmptyMessage>}
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

      <CardContent>
        <div className="flex gap-x-2 flex-wrap">
          <CardDescription className="text-nowrap whitespace-nowrap">
            Chunk size:{data.chunk_size}
          </CardDescription>
          <CardDescription className="text-nowrap whitespace-nowrap">
            Chunk overlap:{data.chunk_overlap}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
