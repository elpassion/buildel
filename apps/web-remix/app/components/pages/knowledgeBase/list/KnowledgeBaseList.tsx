import React from "react";
import { ItemList } from "~/components/list/ItemList";
import {
  IKnowledgeBaseFile,
  IKnowledgeBaseFileList,
} from "../knowledgeBase.types";
interface KnowledgeBaseListProps {
  items: IKnowledgeBaseFileList;
}

export const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({
  items,
}) => {
  return (
    <ItemList
      items={items}
      renderItem={(item) => <KnowledgeBaseListItem {...item} />}
    />
  );
};

export const KnowledgeBaseListItem: React.FC<IKnowledgeBaseFile> = ({
  file_name,
}) => {
  return (
    <article>
      <h3>{file_name}</h3>
    </article>
  );
};
