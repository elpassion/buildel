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
    <div
      className={classNames(
        "flex justify-center items-center flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
