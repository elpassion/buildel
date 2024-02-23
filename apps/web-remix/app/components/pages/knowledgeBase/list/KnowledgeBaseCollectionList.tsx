import React from "react";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { Link, useFetcher } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { IKnowledgeBaseCollection } from "../knowledgeBase.types";
import { confirm } from "~/components/modal/confirm";
import { IconButton } from "~/components/iconButton";
import { Icon } from "@elpassion/taco";

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
          { method: "DELETE" }
        ),
      confirmText: "Delete collection",
      children: (
        <p className="text-neutral-100 text-sm">
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
          />
        </Link>
      )}
    />
  );
};

interface KnowledgeBaseCollectionListItemProps {
  data: IKnowledgeBaseCollection;
  onDelete: (collection: IKnowledgeBaseCollection) => void;
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
    <article className="group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 grid grid-cols-1 gap-1 max-w-full items-center md:gap-2 md:grid-cols-[1fr_30px] ">
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {data.name}
        </h3>
      </header>

      <IconButton
        size="xs"
        variant="ghost"
        aria-label={`Remove collection: ${data.name}`}
        className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
        title={`Remove collection: ${data.name}`}
        icon={<Icon iconName="trash" />}
        onClick={handleDelete}
      />
    </article>
  );
};
