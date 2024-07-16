import classNames from "classnames";
import { SubMenu as RcSubMenu } from "rc-menu";
import React, { PropsWithChildren, ReactNode } from "react";
import "./createBlockSubMenu.styles.css";
import "rc-menu/assets/index.css";

export const GroupSubMenu = ({
  className,
  popupClassName,
  ...rest
}: PropsWithChildren<{
  className?: string;
  popupClassName?: string;
  title: ReactNode;
}>) => {
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
