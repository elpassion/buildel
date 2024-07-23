import React from 'react';
import RcMenu from 'rc-menu';
import type { MenuProps } from 'rc-menu';

import 'rc-menu/assets/index.css';

import { cn } from '~/utils/cn';

export const MenuClient: React.FC<MenuProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <RcMenu
      className={cn(
        'border border-input bg-white !rounded-xl !shadow-none !p-1 overflow-hidden',
        className,
      )}
      {...rest}
    >
      {children}
    </RcMenu>
  );
};
