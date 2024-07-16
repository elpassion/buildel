import React from "react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { Tooltip } from "~/components/tooltip/Tooltip";
import type { ITooltip } from "react-tooltip";

interface HelpfulIconProps {
  text: string;
  id: string;
  className?: string;
  place?: ITooltip["place"];
  size?: "md" | "xl" | "sm";
}

export function HelpfulIcon({
  className,
  place = "bottom",
  size = "xl",
  text,
  id,
}: HelpfulIconProps) {
  return (
    <>
      <Tooltip
        anchorSelect={`#${id}-helpful-icon`}
        content={text}
        className="!text-xs max-w-[350px] "
        place={place}
      />
      <Icon
        id={`${id}-helpful-icon`}
        iconName="help-circle"
        className={classNames(
          "text-primary-500  cursor-pointer",
          {
            "text-xl": size === "xl",
            "text-md": size === "md",
            "text-sm": size === "sm",
          },
          className
        )}
      />
    </>
  );
}
