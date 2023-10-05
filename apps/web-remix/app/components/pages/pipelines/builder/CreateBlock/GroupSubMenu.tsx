import React from "react";
import { SubMenu as RcSubMenu, SubMenuProps } from "rc-menu";
import classNames from "classnames";
import { LinksFunction } from "@remix-run/node";
import styles from "./createBlockSubMenu.styles.css";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
export const GroupSubMenu: React.FC<SubMenuProps> = ({
  className,
  popupClassName,
  ...rest
}) => {
  return (
    <RcSubMenu
      className={classNames(
        "cursor-pointer !text-white !shadow-none !text-xs !bg-transparent",
        className
      )}
      popupClassName={classNames(
        "!shadow-none !border-none !pr-3 !bg-transparent",
        popupClassName
      )}
      {...rest}
    />
  );
};
