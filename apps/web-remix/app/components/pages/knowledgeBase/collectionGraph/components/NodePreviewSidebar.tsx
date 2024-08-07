import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

interface NodePreviewSidebarProps {
  isOpen: boolean;
}

export const NodePreviewSidebar = ({
  isOpen,
  children,
}: PropsWithChildren<NodePreviewSidebarProps>) => {
  return (
    <aside
      className={cn(
        'w-[250px] h-[calc(100%_-_16px)] lg:min-w-[400px] absolute top-4 right-0 z-[12] bg-white rounded-tl-2xl rounded-bl-2xl border border-input transition-transform p-4 overflow-y-auto',
        {
          'translate-x-auto': isOpen,
          'translate-x-full': !isOpen,
        },
      )}
    >
      {children}
    </aside>
  );
};
