import React from 'react';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { File, Plus, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import { routes } from '~/utils/routes.utils';

import type {
  IKnowledgeBaseFile,
  IKnowledgeBaseFileList,
} from '../knowledgeBase.types';
import type { loader } from './loader.server';

interface KnowledgeBaseFileListProps {
  items: IKnowledgeBaseFileList;
}

export const KnowledgeBaseFileList: React.FC<KnowledgeBaseFileListProps> = ({
  items,
}) => {
  const fetcher = useFetcher();
  const { organizationId, collectionName } = useLoaderData<typeof loader>();
  const handleDelete = (file: IKnowledgeBaseFile) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ memoryId: file.id }, { method: 'delete' }),
      confirmText: 'Delete item',
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to delete the{' '}
          <span className="block font-bold max-w-full truncate">
            "{file.file_name}”
          </span>{' '}
          file from your knowledge base. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      aria-label="Collection files"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
      items={items}
      renderItem={(item) => (
        <BasicLink
          to={routes.collectionMemory(
            organizationId,
            collectionName,
            item.id,
            item.file_name,
          )}
        >
          <KnowledgeBaseFileListItem data={item} onDelete={handleDelete} />
        </BasicLink>
      )}
    >
      <li>
        <Link
          to={routes.collectionFilesNew(organizationId, collectionName)}
          className="bg-neutral-900 transition rounded-lg py-2 px-6 w-full text-neutral-600 hover:text-neutral-300 flex flex-col items-center justify-center h-[80px] border border-neutral-800 hover:border-neutral-700"
        >
          <Plus />
          <p className="font-medium">Add new memory file</p>
        </Link>
      </li>
    </ItemList>
  );
};

interface KnowledgeBaseFileListItemProps {
  data: IKnowledgeBaseFile;
  onDelete: (file: IKnowledgeBaseFile) => void;
}

export const KnowledgeBaseFileListItem: React.FC<
  KnowledgeBaseFileListItemProps
> = ({ data, onDelete }) => {
  const handleDelete = () => {
    onDelete(data);
  };
  return (
    <article className="relative group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6">
      <header>
        <h3 className="text-lg font-medium text-white mb-1 max-w-[90%] truncate">
          {data.file_name}
        </h3>

        <p className="text-xs text-white flex gap-2">
          <File className="w-4 h-4" />{' '}
          <span className="uppercase">{data.file_type}</span>
        </p>
      </header>

      <div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.preventDefault()}
      >
        <IconButton
          size="xxs"
          variant="ghost"
          aria-label={`Delete file: ${data.file_name}`}
          className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500"
          icon={<Trash />}
          onClick={handleDelete}
        />
      </div>
    </article>
  );
};
