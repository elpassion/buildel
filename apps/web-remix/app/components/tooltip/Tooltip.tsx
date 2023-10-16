import React from "react";
import { Tooltip as ReactTooltip, ITooltip } from "react-tooltip";

export const Tooltip: React.FC<ITooltip> = ({ children, ...props }) => {
  return (
    <ReactTooltip
      place="right"
      openOnClick={false}
      className="!text-primary-500"
      {...props}
    >
      {children}
    </ReactTooltip>
  );
};
