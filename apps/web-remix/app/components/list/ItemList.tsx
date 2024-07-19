import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ItemListProps<T> {
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

export const EmptyMessage: React.FC<
  PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <span className={classNames('text-sm text-muted-foreground', className)}>
      {children}
    </span>
  );
};
