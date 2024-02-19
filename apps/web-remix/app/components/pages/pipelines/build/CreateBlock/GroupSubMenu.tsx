import classNames from "classnames";
import { SubMenu as RcSubMenu, SubMenuProps } from "rc-menu";
import React from "react";
import "./createBlockSubMenu.styles.css";
import "rc-menu/assets/index.css";

export const GroupSubMenu: React.FC<SubMenuProps> = ({
  className,
  popupClassName,
  ...rest
}) => {
  return (
    <RcSubMenu
      className={classNames(
        "cursor-pointer !text-white !shadow-none !text-xs !bg-transparent",
        className,
      )}
      popupClassName={classNames(
        "!shadow-none !border-none !pr-3 !bg-transparent",
        popupClassName,
      )}
      {...rest}
    />
  );
};
