import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { Edit, EllipsisVertical, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
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
import { dayjs } from '~/utils/Dayjs';

import type { ISecretKey, ISecretKeyList } from '../variables.types';
import { EditSecretKeyModal } from './EditSecretKeyModal';

interface SecretKeyListProps {
  items: ISecretKeyList;
}

export const SecretKeyList: React.FC<SecretKeyListProps> = ({ items }) => {
  const fetcher = useFetcher();
  const [editableKey, setEditableKey] = useState<ISecretKey | null>(null);
  const handleDelete = async (secretKey: ISecretKey) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ name: secretKey.name }, { method: 'DELETE' }),
      confirmText: 'Delete Key',
      children: (
        <p className="text-sm">
          You are about to delete the "{secretKey.name}” Secret. This action is
          irreversible.
        </p>
      ),
    });
  };

  const handleEdit = (secretKey: ISecretKey) => {
    setEditableKey(secretKey);
  };

  const handleCloseEditing = () => {
    setEditableKey(null);
  };

  return (
    <>
      <ItemList
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        items={items}
        aria-label="Secret list"
        emptyText={
          <EmptyMessage className="block mt-14 md:mt-20">
            There is no Secrets yet...
          </EmptyMessage>
        }
        renderItem={(item) => (
          <SecretKeyItem
            data={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      />

      {editableKey && (
        <EditSecretKeyModal
          isOpen={!!editableKey}
          onClose={handleCloseEditing}
          initialData={editableKey}
        />
      )}
    </>
  );
};

interface SecretKeyItemProps {
  data: ISecretKey;
  onDelete: (secretKey: ISecretKey) => void;
  onEdit: (secretKey: ISecretKey) => void;
}

export const SecretKeyItem: React.FC<SecretKeyItemProps> = ({
  data,
  onDelete,
  onEdit,
}) => {
  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data);
  };

  const handleEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(data);
  };

  return (
    <Card>
      <CardHeader className="max-w-full flex-row gap-2 items-center justify-between space-y-0">
        <div>
          <CardTitle className="line-clamp-2">{data.name}</CardTitle>
        </div>

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
              onClick={handleEdit}
              className="flex gap-1 items-center"
              aria-label={`Edit secret: ${data.name}`}
              title={`Edit Secret: ${data.name}`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </DropdownMenuItem>
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
      </CardHeader>

      <CardContent>
        <CardDescription>Value: {data.hidden_value}</CardDescription>
        <CardDescription>{dayjs(data.updated_at).format()}</CardDescription>
        {data.alias && (
          <CardDescription>Default for: {data.alias}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
};
