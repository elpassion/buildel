import { RemixNavLinkProps } from "@remix-run/react/dist/components";
import { NavLink } from "@remix-run/react";
import {
  SidebarMenuItem,
  SidebarMenuItemProps,
} from "~/components/sidebar/SidebarMenuItem";

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
