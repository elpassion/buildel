import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ChatWrapperProps {
  className?: string;
}

export const ChatWrapper: React.FC<PropsWithChildren<ChatWrapperProps>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={classNames(
        'w-full bg-neutral-900 rounded-lg py-2 px-3 border border-neutral-800 flex flex-col gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
};
