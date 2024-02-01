import React, { PropsWithChildren } from "react";
import { NavLink, NavLinkProps } from "@remix-run/react";
import classNames from "classnames";

export const OutlinedNavigation: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <ul className="flex gap-2 border-b border-neutral-600 w-full">
      {children}
    </ul>
  );
};

export const OutlinedNavigationLink = ({ children, ...rest }: NavLinkProps) => {
  return (
    <NavLink
      prefetch="intent"
      className={({ isActive }) =>
        classNames("text-sm pb-2 px-3", {
          "border-b-2 border-white text-white": isActive,
          "text-neutral-300": !isActive,
        })
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};
