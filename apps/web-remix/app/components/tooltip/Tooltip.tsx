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
      className={classNames("!text-primary-500 !py-1 !px-2", className)}
      offset={17}
      {...props}
    >
      {children}
    </ReactTooltip>
  );
};
