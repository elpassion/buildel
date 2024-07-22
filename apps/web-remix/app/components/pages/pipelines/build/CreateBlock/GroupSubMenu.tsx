import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import { SubMenu as RcSubMenu } from 'rc-menu';

import './createBlockSubMenu.styles.css';
import 'rc-menu/assets/index.css';

import { cn } from '~/utils/cn';

export const GroupSubMenu = ({
  className,
  popupClassName,
  ...rest
}: PropsWithChildren<{
  className?: string;
  popupClassName?: string;
  title: ReactNode;
}>) => {
  return (
    <RcSubMenu
      className={cn(
        'cursor-pointer !text-foreground !shadow-none !text-xs !bg-transparent',
        className,
      )}
      popupClassName={cn(
        '!shadow-none !border-none !pr-3 !bg-transparent',
        popupClassName,
      )}
      {...rest}
    />
  );
};
