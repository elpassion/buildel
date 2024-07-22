import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

interface ChatWrapperProps {
  className?: string;
}

export const ChatWrapper: React.FC<PropsWithChildren<ChatWrapperProps>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full bg-muted rounded-lg py-2 px-3 border border-input flex flex-col gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
};
