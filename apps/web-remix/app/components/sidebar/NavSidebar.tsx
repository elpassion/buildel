import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { NavLink, useLocation } from '@remix-run/react';
import type { RemixNavLinkProps } from '@remix-run/react/dist/components';
import kebabCase from 'lodash.kebabcase';

import { PageOverlay } from '~/components/overlay/PageOverlay';
import type { SidebarProps } from '~/components/sidebar/sidebar.types';
import { Sidebar } from '~/components/sidebar/siebar';
import { Tooltip } from '~/components/tooltip/Tooltip';
import { cn } from '~/utils/cn';

export const NavSidebar: React.FC<
  Omit<SidebarProps, 'collapsed' | 'onCollapse'>
> = ({ children, ...props }) => {
  const { collapsed, toggleCollapse } = useNavSidebarContext();
  return (
    <div className="hidden lg:block md:p-4">
      <Sidebar
        collapseButton
        className="sticky top-4 !h-[calc(100vh-32px)] rounded-xl"
        collapseButtonClassName="absolute top-[60px] !z-10 -right-2"
        collapsed={collapsed}
        onCollapse={toggleCollapse}
        {...props}
      >
        {children}
      </Sidebar>
    </div>
  );
};

export const NavMobileSidebar: React.FC<
  Omit<SidebarProps, 'collapsed' | 'onCollapse'>
> = ({ children, ...props }) => {
  const { isOpen, closeSidebar } = useNavSidebarContext();
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);
  return (
    <>
      <PageOverlay
        isShow={isOpen}
        onClick={closeSidebar}
        className="lg:hidden"
      />
      <div className="lg:hidden">
        <Sidebar
          className={cn(
            'fixed top-0 left-0 !h-[100dvh] rounded-r-[1.25rem] z-50 transition duration-200 ease-[cubic-bezier(0.25, 1, 0.5, 1)]',
            {
              '-translate-x-full pointer-events-none': !isOpen,
            },
          )}
          collapseButton={false}
          collapsed={false}
          {...props}
        >
          {children}
        </Sidebar>
      </div>
    </>
  );
};

type SidebarLinkProps = RemixNavLinkProps & SidebarMenuItemProps;
export function SidebarLink({
  icon,
  text,
  onlyIcon,
  isActive: propsIsActive,
  ...props
}: SidebarLinkProps) {
  return (
    <NavLink prefetch="intent" {...props}>
      {({ isActive }) => (
        <>
          <SidebarMenuItem
            id={`${kebabCase(text)}-nav-item`}
            icon={icon}
            text={text}
            onlyIcon={onlyIcon}
            isActive={propsIsActive ?? isActive}
            data-tooltip-delay-show={500}
          />
          {onlyIcon && (
            <Tooltip
              offset={17}
              anchorSelect={`#${kebabCase(text)}-nav-item`}
              content={text}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export interface SidebarMenuItemProps {
  text?: string;
  isActive?: boolean;
  onlyIcon?: boolean;
  icon: ReactNode;
  id?: string;
}
export function SidebarMenuItem({
  text,
  icon,
  isActive,
  onlyIcon,
  id,
  ...rest
}: SidebarMenuItemProps) {
  return (
    <div
      id={id}
      className={cn(
        'group flex items-center space-x-2 rounded-lg transition ',
        {
          'text-muted-foreground hover:text-foreground': !isActive,
          'w-full ': !onlyIcon,
        },
      )}
      {...rest}
    >
      <div
        className={cn(
          'border border-neutral-100 min-w-9 w-9 min-h-9 h-9 rounded-lg flex justify-center items-center flex-shrink-0',
          {
            'bg-transparent text-muted-foreground group-hover:text-foreground':
              !isActive,
            'bg-foreground text-white group-hover:bg-foreground/80': isActive,
          },
        )}
      >
        {icon}
      </div>

      {text && !onlyIcon && (
        <span className="block max-w-[80%] text-sm font-medium whitespace-nowrap truncate">
          {text}
        </span>
      )}
    </div>
  );
}

interface INavSidebarContext {
  collapsed: boolean;
  toggleCollapse: () => void;
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}
export const NavSidebarContext = React.createContext<
  INavSidebarContext | undefined
>(undefined);

export const useNavSidebarContext = () => {
  const ctx = React.use(NavSidebarContext);

  if (!ctx) {
    throw new Error(
      'useNavSidebarContext must be used inside NavSidebarContextProvider',
    );
  }

  return ctx;
};
