import React from "react";
import { Icon } from "@elpassion/taco";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { confirm } from "~/components/modal/confirm";
import { IconButton } from "~/components/iconButton";
import { IApiKeyList, IApiKey } from "../variables.types";
import { useFetcher } from "@remix-run/react";
import dayjs from "dayjs";

interface ApiKeyListProps {
  items: IApiKeyList;
}

export const ApiKeyList: React.FC<ApiKeyListProps> = ({ items }) => {
  const fetcher = useFetcher();

  const handleDelete = async (apiKey: IApiKey) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ id: apiKey.id }, { method: "DELETE" }),
      confirmText: "Delete Key",
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to delete the API Key. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      className="grid grid-cols-1 gap-2"
      items={items}
      emptyText={<EmptyMessage>There is no API Keys yet...</EmptyMessage>}
      renderItem={(item) => (
        <ApiKeyItem
          data={item}
          onDelete={handleDelete}
          isLoading={fetcher.state !== "idle"}
        />
      )}
    />
  );
};

interface SecretKeyItemProps {
  data: IApiKey;
  onDelete: (apiKey: IApiKey) => void;
  isLoading?: boolean;
}

export const ApiKeyItem: React.FC<SecretKeyItemProps> = ({
  data,
  onDelete,
  isLoading,
}) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data);
  };

  return (
    <article className="group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 grid grid-cols-1 gap-1 max-w-full items-center md:gap-2 md:grid-cols-[1fr_300px_40px] ">
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {dayjs(data.created_at).format("DD/MM/YYYY HH:mm")}
        </h3>
      </header>

      <p className="text-white">{data.key}</p>

      <IconButton
        size="xs"
        variant="ghost"
        aria-label="Remove API Key"
        className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
        title={`Remove API Key: ${data.id}`}
        icon={<Icon iconName="trash" />}
        onClick={handleDelete}
        disabled={isLoading}
      />
    </article>
  );
};
