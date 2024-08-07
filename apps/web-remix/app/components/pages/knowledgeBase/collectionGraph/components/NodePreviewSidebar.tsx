import type { PropsWithChildren } from 'react';
import React, { createContext, useContext } from 'react';
import { X } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';

interface NodePreviewSidebarProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}

export const NodePreviewSidebar = ({
  isOpen,
  children,
  onOpenChange,
}: PropsWithChildren<NodePreviewSidebarProps>) => {
  return (
    <NodePreviewSidebarContext.Provider value={{ isOpen, onOpenChange }}>
      <aside
        className={cn(
          'w-[250px] h-[calc(100%_-_16px)] lg:min-w-[400px] absolute top-4 right-0 z-[12] bg-white rounded-tl-2xl rounded-bl-2xl border border-input transition-transform overflow-y-auto',
          {
            'translate-x-auto': isOpen,
            'translate-x-full': !isOpen,
          },
        )}
      >
        {children}
      </aside>
    </NodePreviewSidebarContext.Provider>
  );
};

export const NodePreviewSidebarHeader = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { onOpenChange } = useNodePreviewSidebar();
  return (
    <header
      className={cn('flex justify-between items-center px-4 mt-4', className)}
      {...rest}
    >
      {children}

      <IconButton
        size="xxs"
        variant="ghost"
        icon={<X />}
        onClick={() => onOpenChange(false)}
      />
    </header>
  );
};

export const NodePreviewSidebarContent = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('p-4', className)} {...rest}>
      {children}
    </div>
  );
};

interface INodePreviewSidebarContext {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}
const NodePreviewSidebarContext =
  createContext<INodePreviewSidebarContext | null>(null);

function useNodePreviewSidebar() {
  const context = useContext(NodePreviewSidebarContext);
  if (!context) {
    throw new Error(
      'useNodePreviewSidebar must be used within a NodePreviewSidebarProvider',
    );
  }
  return context;
}
