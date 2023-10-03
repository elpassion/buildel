import React, { ReactNode, useEffect } from "react";
import { SidebarProps, Sidebar } from "@elpassion/taco";
import classNames from "classnames";
import { PageOverlay } from "~/components/overlay/PageOverlay";
import { RemixNavLinkProps } from "@remix-run/react/dist/components";
import { NavLink, useLocation } from "@remix-run/react";

export const NavSidebar: React.FC<
  Omit<SidebarProps, "collapsed" | "onCollapse">
> = ({ children, ...props }) => {
  const { collapsed, toggleCollapse } = useNavSidebarContext();
  return (
    <div className="hidden lg:block md:p-4">
      <Sidebar
        className="sticky top-0 !h-[calc(100vh-32px)] rounded-[1.25rem]"
        collapseBtnClassName="absolute top-[60px] !z-10 -right-2"
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
  Omit<SidebarProps, "collapsed" | "onCollapse">
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
          className={classNames(
            "fixed top-0 left-0 !h-screen rounded-r-[1.25rem] z-50 transition duration-200 ease-[cubic-bezier(0.25, 1, 0.5, 1)]",
            {
              "-translate-x-full pointer-events-none": !isOpen,
            }
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

type SidebarLinkProps = RemixNavLinkProps &
  Omit<SidebarMenuItemProps, "isActive">;
export function SidebarLink({
  icon,
  text,
  onlyIcon,
  ...props
}: SidebarLinkProps) {
  return (
    <NavLink {...props}>
      {({ isActive }) => (
        <SidebarMenuItem
          icon={icon}
          text={text}
          isActive={isActive}
          onlyIcon={onlyIcon}
        />
      )}
    </NavLink>
  );
}

export interface SidebarMenuItemProps {
  text?: string;
  isActive?: boolean;
  onlyIcon?: boolean;
  icon: ReactNode;
}
export function SidebarMenuItem({
  text,
  icon,
  isActive,
  onlyIcon,
}: SidebarMenuItemProps) {
  return (
    <div
      className={classNames(
        "flex items-center space-x-2 p-2 rounded-lg text-neutral-100 hover:bg-neutral-700 transition",
        {
          "bg-transparent": !isActive,
          "bg-neutral-700": isActive,
          "w-full": !onlyIcon,
          "w-9 h-9": onlyIcon,
        }
      )}
    >
      {icon}

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
  const ctx = React.useContext(NavSidebarContext);

  if (!ctx) {
    throw new Error(
      "useNavSidebarContext must be used inside NavSidebarContextProvider"
    );
  }

  return ctx;
};
