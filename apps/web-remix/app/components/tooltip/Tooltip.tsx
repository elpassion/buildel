import React from "react";
import classNames from "classnames";
import { Tooltip as ReactTooltip } from "react-tooltip";
import type { ITooltip } from "react-tooltip";

export const Tooltip: React.FC<ITooltip> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ReactTooltip
      place="right"
      openOnClick={false}
      className={classNames("!text-white !py-1 !px-2 !z-[30]", className)}
      {...props}
    >
      {children}
    </ReactTooltip>
  );
};
