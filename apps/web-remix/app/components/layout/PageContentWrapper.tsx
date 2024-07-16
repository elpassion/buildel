import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

interface PageContentWrapperProps extends PropsWithChildren {
  className?: string;
}

export const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={classNames(
        'max-w-[1344px] px-4 mx-auto w-full md:px-6 lg:px-10',
        className,
      )}
    >
      {children}
    </div>
  );
};
