import React from "react";
import { SidebarProps, Sidebar } from "@elpassion/taco";
import classNames from "classnames";
import { PageOverlay } from "~/components/overlay/PageOverlay";

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
