import React from "react";
import { Navbar, NavbarProps } from "@elpassion/taco";
import { useNavSidebarContext } from "~/components/sidebar/NavSidebar";

export const AppNavbar: React.FC<
  Omit<NavbarProps, "wrapperClassName" | "menuClassName" | "onMenuClick">
> = ({ children, ...rest }) => {
  const { openSidebar } = useNavSidebarContext();
  return (
    <Navbar
      menuClassName="lg:hidden !text-white"
      wrapperClassName="md:px-2 md:py-2"
      onMenuClick={openSidebar}
      {...rest}
    >
      {children}
    </Navbar>
  );
};
