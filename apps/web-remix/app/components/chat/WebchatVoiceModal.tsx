import React from 'react';

import { cn } from '~/utils/cn';

interface WebchatVoiceModalProps {
  isOpen: boolean;
}

export const WebchatVoiceModal = ({
  isOpen,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & WebchatVoiceModalProps) => {
  return (
    <div
      className={cn(
        'w-full h-[100dvh] bg-white fixed top-0 left-0 right-0 bottom-0 transition-all',
        { 'opacity-0 pointer-events-none': !isOpen },
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
