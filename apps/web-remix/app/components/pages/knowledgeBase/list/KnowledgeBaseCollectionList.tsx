import React from "react";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { Link } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";

interface ICollection {
  id: string;
  name: string;
}
interface KnowledgeBaseCollectionListProps {
  items: ICollection[];
  organizationId: string;
}

export const KnowledgeBaseCollectionList: React.FC<
  KnowledgeBaseCollectionListProps
> = ({ items, organizationId }) => {
  return (
    <ItemList
      className="grid grid-cols-1 gap-2"
      items={items}
      emptyText={<EmptyMessage>There is no collections yet...</EmptyMessage>}
      renderItem={(item) => (
        <Link to={routes.collectionKnowledgeBase(organizationId, item.name)}>
          <KnowledgeBaseCollectionListItem data={item} />
        </Link>
      )}
    />
  );
};

interface KnowledgeBaseCollectionListItemProps {
  data: ICollection;
}

export const KnowledgeBaseCollectionListItem: React.FC<
  KnowledgeBaseCollectionListItemProps
> = ({ data }) => {
  return (
    <article className="group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 grid grid-cols-1 max-w-full items-center md:gap-2 md:grid-cols-[1fr_140px_100px] lg:grid-cols-[1fr_185px_180px]">
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {data.name}
        </h3>
      </header>

      <p className="text-sm text-white">Used in 5 workflows</p>
      <p className="text-sm text-white">6 items</p>
    </article>
  );
};
