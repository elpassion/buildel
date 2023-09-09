import React, { ReactNode } from "react";

interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  className?: string;
  itemClassName?: string;
}

export const ItemList = <T extends { id: number | string }>({
  items,
  renderItem,
  className,
  itemClassName,
}: ItemListProps<T>) => {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li className={itemClassName} key={item.id}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};
