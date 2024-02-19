import RcMenu, { MenuProps } from "rc-menu";
import React from "react";
import classNames from "classnames";
import "rc-menu/assets/index.css";

export const MenuClient: React.FC<MenuProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <RcMenu
      className={classNames(
        "border border-neutral-100 bg-neutral-700 !rounded-lg !shadow-none !p-0 overflow-hidden divide-y divide-solid",
        className
      )}
      {...rest}
    >
      {children}
    </RcMenu>
  );
};
