import { PropsWithChildren } from "react";
import classNames from "classnames";

interface SidebarContentWrapperProps extends PropsWithChildren {
  className?: string;
}
export function SidebarContentWrapper({
  children,
  className,
}: SidebarContentWrapperProps) {
  return (
    <div className={classNames("flex flex-col px-[10px]", className)}>
      {children}
    </div>
  );
}
