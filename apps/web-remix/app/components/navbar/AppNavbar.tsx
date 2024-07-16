import type { PropsWithChildren } from "react";
import React from "react";
import classNames from "classnames";
import type { NavbarProps } from "@elpassion/taco";
import { Navbar } from "@elpassion/taco";
import { useNavSidebarContext } from "~/components/sidebar/NavSidebar";

export const AppNavbar: React.FC<
  Omit<NavbarProps, "wrapperClassName" | "menuClassName" | "onMenuClick">
> = ({ children, ...rest }) => {
  const { openSidebar } = useNavSidebarContext();
  return (
    <Navbar
      menuClassName="lg:hidden !text-white min-w-[24px]"
      wrapperClassName="py-2 md:px-2"
      onMenuClick={openSidebar}
      {...rest}
    >
      {children}
    </Navbar>
  );
};

interface AppNavbarHeadingProps extends PropsWithChildren {
  className?: string;
}
export const AppNavbarHeading = ({
  children,
  className,
}: AppNavbarHeadingProps) => {
  return (
    <h1 className={classNames("text-2xl font-medium text-white", className)}>
      {children}
    </h1>
  );
};
