import React from 'react';
import classNames from 'classnames';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContainer = ({ children, className }: MainContainerProps) => {
  return (
    <main
      className={classNames(
        'h-fit w-full min-w-0 flex-grow bg-neutral-50 p-8',
        className,
      )}
    >
      <div className="mx-auto">{children}</div>
    </main>
  );
};
