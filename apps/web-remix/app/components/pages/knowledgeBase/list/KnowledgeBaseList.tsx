import React from "react";
import { ItemList } from "~/components/list/ItemList";
import {
  IKnowledgeBaseFile,
  IKnowledgeBaseFileList,
} from "../knowledgeBase.types";
import { Icon } from "@elpassion/taco";
import { IconButton } from "~/components/iconButton";
interface KnowledgeBaseListProps {
  items: IKnowledgeBaseFileList;
}

export const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({
  items,
}) => {
  return (
    <ItemList
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
      items={items}
      renderItem={(item) => <KnowledgeBaseListItem {...item} />}
    />
  );
};

export const KnowledgeBaseListItem: React.FC<IKnowledgeBaseFile> = ({
  file_name,
  file_type,
}) => {
  return (
    <article className="relative group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6">
      <header className="mb-4">
        <h3 className="text-lg font-medium text-white mb-1">{file_name}</h3>

        <p className="text-xs text-white flex gap-2">
          <Icon iconName="file" />{" "}
          <span className="uppercase">{file_type}</span>
        </p>
      </header>

      <p className="text-sm text-white">Used in 3 workflows</p>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <IconButton
          size="xs"
          type="button"
          variant="ghost"
          className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500"
          icon={<Icon iconName="trash" />}
        />
      </div>
    </article>
  );
};
