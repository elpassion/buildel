import classNames from "classnames";
import RcMenu, { MenuProps } from "rc-menu";
import React from "react";
import "rc-menu/assets/index.css";

const Menu: React.FC<MenuProps> = ({ className, ...rest }) => {
  return (
    <RcMenu
      className={classNames(
        "border border-neutral-100 bg-neutral-700 !rounded-lg !shadow-none !p-0 overflow-hidden divide-y divide-solid",
        className,
      )}
      {...rest}
    />
  );
};

export default Menu;
