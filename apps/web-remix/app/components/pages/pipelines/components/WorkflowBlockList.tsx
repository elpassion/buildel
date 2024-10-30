import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';

import { resolveBlockTypeIconPath } from '~/components/pages/pipelines/blockTypes.utils';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { cn } from '~/utils/cn';

interface WorkflowBlockListProps {
  blocks: IBlockConfig[];
}

export function WorkflowBlockList({ blocks }: WorkflowBlockListProps) {
  return (
    <ul className="flex -space-x-2">
      {blocks.map((block) => (
        <WorkflowBlockListItem block={block} key={block.name} />
      ))}
    </ul>
  );
}

interface WorkflowBlockListItemProps {
  block: IBlockConfig;
}
function WorkflowBlockListItem({ block }: WorkflowBlockListItemProps) {
  const imageRef = React.useRef<HTMLImageElement>(null);

  const onImageError = () => {
    if (!imageRef.current) return;

    imageRef.current.src = resolveBlockTypeIconPath('default');
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <li className="w-6 h-6 rounded-full bg-white border border-input flex justify-center items-center">
            <ClientOnly
              fallback={
                <div className="w-3.5 h-3.5 bg-secondary rounded-full" />
              }
            >
              {() => (
                <img
                  src={resolveBlockTypeIconPath(`type/${block.type}`)}
                  alt={block.type}
                  onError={onImageError}
                  className="w-3.5 h-3.5"
                  ref={imageRef}
                />
              )}
            </ClientOnly>
          </li>
        </TooltipTrigger>

        <TooltipContent side="top" className="text-xs">
          {block.type}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function WorkflowBlockListOverflow({
  className,
  ...rest
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) {
  return (
    <div
      className={cn(
        'absolute h-6 w-8 right-0 bottom-2 bg-gradient-to-r from-transparent to-white pointer-events-none xl:bottom-0',
        className,
      )}
      {...rest}
    />
  );
}
