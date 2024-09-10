import type { ReactNode } from "react";
import React from "react";

import { cn } from "~/utils/cn";

export interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  emptyText?: ReactNode;
  children?: ReactNode;
}

export const ItemList = <T extends { id: number | string }>({
  items,
  renderItem,
  className,
  itemClassName,
  emptyText,
  children,
  ...rest
}: ItemListProps<T> & React.HTMLProps<HTMLUListElement>) => {
  return (
    <ul className={className} {...rest}>
      {emptyText && <li className="hidden last:block">{emptyText}</li>}
      {children}
      {items.map((item, index) => (
        <li className={itemClassName} key={item.id}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
};

export type EmptyMessageProps = React.HTMLAttributes<HTMLSpanElement>;

export const EmptyMessage = ({ children, className }: EmptyMessageProps) => {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </span>
  );
};
