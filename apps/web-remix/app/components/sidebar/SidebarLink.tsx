import { RemixNavLinkProps } from "@remix-run/react/dist/components";
import { NavLink } from "@remix-run/react";
import classNames from "classnames";

export function SidebarLink(props: RemixNavLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        classNames(
          "w-8 h-8 rounded-lg bg-transparent text-neutral-100 hover:bg-neutral-700 flex justify-center items-center",
          {
            "bg-neutral-700": isActive,
          }
        )
      }
      {...props}
    />
  );
}
