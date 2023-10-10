import React, { useState } from "react";
import { Icon } from "@elpassion/taco";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { confirm } from "~/components/modal/confirm";
import { IconButton } from "~/components/iconButton";
import { IApiKey, IApiKeyList } from "../apiKeys.types";
import { EditApiKeyModal } from "~/components/pages/apiKeys/list/EditApiKeyModal";

interface ApiKeysListProps {
  items: IApiKeyList;
  organizationId: string;
}

export const ApiKeysList: React.FC<ApiKeysListProps> = ({
  items,
  organizationId,
}) => {
  const [editableKey, setEditableKey] = useState<IApiKey | null>(null);
  const handleDelete = async (apiKey: IApiKey) => {
    confirm({
      // onConfirm: async () =>
      //   fetcher.submit(
      //     { collectionName: collection.name },
      //     { method: "DELETE" }
      //   ),
      confirmText: "Delete Key",
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to delete the "{apiKey.name}” API Key. This action is
          irreversible.
        </p>
      ),
    });
  };

  const handleEdit = (apiKey: IApiKey) => {
    setEditableKey(apiKey);
  };

  const handleCloseEditing = () => {
    setEditableKey(null);
  };

  return (
    <>
      <ItemList
        className="grid grid-cols-1 gap-2"
        items={items}
        emptyText={<EmptyMessage>There is no API Keys yet...</EmptyMessage>}
        renderItem={(item) => (
          <ApiKeyItem data={item} onDelete={handleDelete} onEdit={handleEdit} />
        )}
      />

      {editableKey && (
        <EditApiKeyModal
          isOpen={!!editableKey}
          onClose={handleCloseEditing}
          initialData={editableKey}
        />
      )}
    </>
  );
};

interface ApiKeyItemProps {
  data: IApiKey;
  onDelete: (apiKey: IApiKey) => void;
  onEdit: (apiKey: IApiKey) => void;
}

export const ApiKeyItem: React.FC<ApiKeyItemProps> = ({
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
          SAMPLE KEY
        </h3>
      </header>

      <p className="text-white">*************123456</p>

      <div className="flex gap-1 items-center">
        <IconButton
          size="xs"
          type="button"
          variant="ghost"
          className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-primary-500 lg:opacity-0"
          title={`Edit API Key: ${data.name}`}
          icon={<Icon iconName="edit" />}
          onClick={handleEdit}
        />

        <IconButton
          size="xs"
          type="button"
          variant="ghost"
          className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
          title={`Remove API Key: ${data.name}`}
          icon={<Icon iconName="trash" />}
          onClick={handleDelete}
        />
      </div>
    </article>
  );
};
