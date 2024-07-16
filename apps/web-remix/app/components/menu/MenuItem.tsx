import React from 'react';
import classNames from 'classnames';
import { MenuItem as RcMenuItem } from 'rc-menu';
import type { MenuItemProps } from 'rc-menu';

export const MenuItem: React.FC<MenuItemProps> = ({ className, ...rest }) => {
  return (
    <RcMenuItem
      className={classNames(
        'cursor-pointer !bg-neutral-700 hover:!bg-neutral-950 active:!bg-neutral-950 focus:!bg-neutral-950 !text-white',
        className,
      )}
      {...rest}
    />
  );
};
