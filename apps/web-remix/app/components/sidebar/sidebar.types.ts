import type { PropsWithChildren, ReactNode } from 'react';

import type { IconButtonProps } from '~/components/iconButton';

export type ICollapseButton =
  | boolean
  | ((isCollapsed: boolean, toggle: () => void) => ReactNode);

export interface CollapseButtonProps {
  collapsedAriaLabel?: string;
  notCollapsedAriaLabel?: string;
  renderButton?: ICollapseButton;
  className?: string;
}

export interface SidebarBreakpoints {
  mobile?: string;
  narrow?: string;
  wide?: string;
}
export interface SidebarProps extends PropsWithChildren {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapseButton?: ICollapseButton;
  collapseButtonClassName?: string;
  bottomContent?: ReactNode;
  topContent?: ReactNode;
  breakpoints?: Omit<SidebarBreakpoints, 'mobile'>;
  tabIndex?: number;
  collapsedToggleButtonProps?: Partial<IconButtonProps>;
  notCollapsedToggleButtonProps?: Partial<IconButtonProps>;
  id?: string;
  testId?: string;
  className?: string;
}

export interface ResponsiveSidebarProps
  extends Omit<SidebarProps, 'className'> {
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  close?: () => void;
  maskClassName?: string;
  drawerClassName?: string;
  sidebarClassName?: string;
  breakpoints?: SidebarBreakpoints;
}

export interface SidebarMaskProps {
  close: () => void;
  className?: string;
}
