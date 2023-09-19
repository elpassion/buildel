import { PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

export interface SidebarMenuItemProps {
  text?: string;
  isActive?: boolean;
  onlyIcon?: boolean;
  icon: ReactNode;
}
export function SidebarMenuItem({
  text,
  icon,
  isActive,
  onlyIcon,
}: SidebarMenuItemProps) {
  return (
    <div
      className={classNames(
        "flex items-center space-x-2 p-2  rounded-lg bg-transparent text-neutral-100 hover:bg-neutral-700",
        {
          "bg-neutral-700": isActive,
          "w-full": !onlyIcon,
          "w-9 h-9": onlyIcon,
        }
      )}
    >
      {icon}

      {text && !onlyIcon && (
        <span className="block max-w-[80%] text-sm font-medium whitespace-nowrap truncate">
          {text}
        </span>
      )}
    </div>
  );
}
