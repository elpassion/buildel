import React, { PropsWithChildren } from "react";
import classNames from "classnames";
interface PageContentWrapperProps extends PropsWithChildren {
  className?: string;
}

export const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={classNames("px-4 mx-auto w-full md:px-6 lg:px-10", className)}
    >
      {children}
    </div>
  );
};
