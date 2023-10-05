import React, { PropsWithChildren } from "react";
import { Navbar, NavbarProps } from "@elpassion/taco";
import { useNavSidebarContext } from "~/components/sidebar/NavSidebar";

export const AppNavbar: React.FC<
  Omit<NavbarProps, "wrapperClassName" | "menuClassName" | "onMenuClick">
> = ({ children, ...rest }) => {
  const { openSidebar } = useNavSidebarContext();
  return (
    <Navbar
      menuClassName="lg:hidden !text-white"
      wrapperClassName="py-2 md:px-2"
      onMenuClick={openSidebar}
      {...rest}
    >
      {children}
    </Navbar>
  );
};

export const AppNavbarHeading = ({ children }: PropsWithChildren) => {
  return <h1 className="text-2xl font-medium text-white">{children}</h1>;
};
