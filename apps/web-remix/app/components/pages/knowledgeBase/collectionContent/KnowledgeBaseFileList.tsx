import React from 'react';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { EllipsisVertical, File, Plus, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
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
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import {
  FloatingListActions,
  FloatingListCheckbox,
  ListActionProvider,
  useListAction,
} from '../components/ListActionProvider';
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
        fetcher.submit(
          { memoryId: file.id },
          { method: 'delete', encType: 'application/json' },
        ),
      confirmText: 'Delete item',
      children: (
        <p className="text-sm">
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
    <ListActionProvider>
      <ItemList
        aria-label="Collection files"
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
          <Link to={routes.collectionFilesNew(organizationId, collectionName)}>
            <Card className="bg-muted">
              <CardContent className="min-h-[90px] pt-3 h-full flex justify-center items-center flex-col">
                <CardDescription className="text-sm group-hover:text-foreground transition">
                  <Plus className="mx-auto" />
                  <span className="font-medium">Add new memory</span>
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </li>
      </ItemList>

      <FloatingListActions
        onDelete={(fetcher, ids) => {
          confirm({
            children: (
              <p className="text-sm">
                You are about to delete the {ids.length} file(s) from your
                collection. This action is irreversible.
              </p>
            ),
            onConfirm: async () => {
              fetcher.submit(
                { memoryIds: ids, intent: 'DELETE_MANY' },
                { method: 'delete', encType: 'application/json' },
              );
            },
          });
        }}
      />
    </ListActionProvider>
  );
};

interface KnowledgeBaseFileListItemProps {
  data: IKnowledgeBaseFile;
  onDelete: (file: IKnowledgeBaseFile) => void;
}

export const KnowledgeBaseFileListItem: React.FC<
  KnowledgeBaseFileListItemProps
> = ({ data, onDelete }) => {
  const { isSelected, removeItem } = useListAction();

  const handleDelete = () => {
    removeItem(data.id.toString());
    onDelete(data);
  };

  const isChecked = isSelected(data.id.toString());

  return (
    <Card
      className={cn('group relative', {
        'border-red-200': isChecked,
      })}
    >
      <CardHeader className="max-w-full flex-row gap-2 items-center justify-between space-y-0">
        <FloatingListCheckbox itemId={data.id.toString()} />

        <CardTitle
          className={cn('line-clamp-2', { 'text-red-500': isChecked })}
          title={data.file_name}
        >
          {data.file_name}
        </CardTitle>

        <div onClick={(e) => e.preventDefault()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="text-muted-foreground">
              <IconButton
                variant="ghost"
                size="xs"
                icon={
                  <EllipsisVertical
                    className={cn('w-4 h-4 group-hover:text-muted-foreground', {
                      'text-red-400': isChecked,
                    })}
                  />
                }
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex gap-1 items-center text-red-500"
                onClick={handleDelete}
                title={`Delete file: ${data.file_name}`}
                aria-label={`Delete file: ${data.file_name}`}
              >
                <Trash className="w-4 h-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription
          className={cn(
            'flex gap-1 items-center group-hover:text-muted-foreground',
            {
              'text-red-400': isChecked,
            },
          )}
        >
          <File className="w-4 h-4" />{' '}
          <span className="uppercase">{data.file_type}</span>
        </CardDescription>
      </CardContent>
    </Card>
  );
};
