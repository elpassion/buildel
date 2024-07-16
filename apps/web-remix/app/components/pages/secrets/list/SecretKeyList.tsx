import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { Icon } from '@elpassion/taco';

import { IconButton } from '~/components/iconButton';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
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
        <p className="text-neutral-100 text-sm">
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
        className="grid grid-cols-1 gap-2"
        items={items}
        aria-label="Secret list"
        emptyText={<EmptyMessage>There is no Secrets yet...</EmptyMessage>}
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
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(data);
  };

  return (
    <article className="group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 grid grid-cols-1 gap-1 max-w-full items-center md:gap-2 md:grid-cols-[1fr_300px_60px] ">
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {data.name}
        </h3>
      </header>

      <p className="text-white">{dayjs(data.updated_at).format()}</p>

      <div className="flex gap-1 items-center">
        <IconButton
          size="xs"
          variant="ghost"
          aria-label={`Edit secret: ${data.name}`}
          className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-primary-500 lg:opacity-0"
          title={`Edit Secret: ${data.name}`}
          icon={<Icon iconName="edit" />}
          onClick={handleEdit}
        />

        <IconButton
          size="xs"
          variant="ghost"
          aria-label={`Delete secret: ${data.name}`}
          className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
          title={`Delete Secret: ${data.name}`}
          icon={<Icon iconName="trash" />}
          onClick={handleDelete}
        />
      </div>
    </article>
  );
};
