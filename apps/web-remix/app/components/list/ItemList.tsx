import React, { PropsWithChildren, ReactNode } from "react";

interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  emptyText?: ReactNode;
}

export const ItemList = <T extends { id: number | string }>({
  items,
  renderItem,
  className,
  itemClassName,
  emptyText,
}: ItemListProps<T>) => {
  return (
    <ul className={className}>
      {emptyText && <li className="hidden last:block">{emptyText}</li>}
      {items.map((item, index) => (
        <li className={itemClassName} key={item.id}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
};

export const EmptyMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return <span className="text-sm text-white">{children}</span>;
};
