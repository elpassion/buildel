import React from "react";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import {
  IKnowledgeBaseFile,
  IKnowledgeBaseFileList,
} from "../knowledgeBase.types";
import { Icon } from "@elpassion/taco";
import { IconButton } from "~/components/iconButton";
import { confirm } from "~/components/modal/confirm";
import { useFetcher } from "@remix-run/react";
interface KnowledgeBaseFileListProps {
  items: IKnowledgeBaseFileList;
}

export const KnowledgeBaseFileList: React.FC<KnowledgeBaseFileListProps> = ({
  items,
}) => {
  const fetcher = useFetcher();
  const handleDelete = (file: IKnowledgeBaseFile) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ memoryId: file.id }, { method: "delete" }),
      confirmText: "Delete item",
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to delete the{" "}
          <span className="block font-bold max-w-full truncate">
            "{file.file_name}”
          </span>{" "}
          file from your knowledge base. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
      items={items}
      emptyText={
        <EmptyMessage>There is no files in collection yet...</EmptyMessage>
      }
      renderItem={(item) => (
        <KnowledgeBaseFileListItem data={item} onDelete={handleDelete} />
      )}
    />
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
          <Icon iconName="file" />{" "}
          <span className="uppercase">{data.file_type}</span>
        </p>
      </header>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <IconButton
          size="xs"
          type="button"
          variant="ghost"
          className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500"
          icon={<Icon iconName="trash" />}
          onClick={handleDelete}
        />
      </div>
    </article>
  );
};
