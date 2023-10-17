import React from "react";
import { Tooltip as ReactTooltip, ITooltip } from "react-tooltip";
import classNames from "classnames";

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
