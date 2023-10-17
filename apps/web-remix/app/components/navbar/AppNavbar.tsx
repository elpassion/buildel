import React, { PropsWithChildren } from "react";
import { Navbar, NavbarProps } from "@elpassion/taco";
import { useNavSidebarContext } from "~/components/sidebar/NavSidebar";
import classNames from "classnames";

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
