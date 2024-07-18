import React from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
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
      className="grid grid-cols-1 gap-2"
      items={items}
      emptyText={<EmptyMessage>There is no Collections yet...</EmptyMessage>}
      renderItem={(item) => (
        <Link to={routes.collectionFiles(organizationId, item.name)}>
          <KnowledgeBaseCollectionListItem
            data={item}
            onDelete={handleDelete}
            organizationId={organizationId}
          />
        </Link>
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
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data);
  };

  return (
    <article className="group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 grid grid-cols-1 gap-1 max-w-full items-center md:gap-2 md:grid-cols-[1fr_60px] ">
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {data.name}
        </h3>
      </header>

      <div className="flex gap-2">
        <IconButton
          size="xs"
          variant="ghost"
          aria-label={`Remove collection: ${data.name}`}
          className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
          title={`Remove collection: ${data.name}`}
          icon={<Trash />}
          onClick={handleDelete}
        />
      </div>
    </article>
  );
};
