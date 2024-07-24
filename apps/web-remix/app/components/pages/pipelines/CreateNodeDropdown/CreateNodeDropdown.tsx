import React from 'react';
import type { Position } from '@xyflow/react';
import startCase from 'lodash.startcase';

import type {
  IBlockType,
  IBlockTypes,
  IIOType,
} from '~/components/pages/pipelines/pipeline.types';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

interface CreateNodeDropdownProps {
  position: { x: number; y: number };
  open: boolean;
  create: (block: IBlockType) => void;
  blockGroups: Record<'string', IBlockTypes>;
}

export const CreateNodeDropdown = React.forwardRef<
  HTMLDivElement,
  CreateNodeDropdownProps
>(({ position, open, create, blockGroups }, ref) => {
  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bg-white pointer-events-auto z-[50] py-1 px-2 rounded-lg border border-input max-h-[400px] max-w-[200px] min-w-[200px] overflow-y-auto',
      )}
      style={{ top: position.y, left: position.x }}
    >
      <ul>
        {Object.keys(blockGroups).map((group) => (
          <li key={group} className="my-2">
            <p className="w-fit text-xs mb-1">{startCase(group)}</p>
            {blockGroups[group].map((block) => {
              return (
                <Button
                  key={block.type}
                  isFluid
                  size="xxs"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => create(block)}
                >
                  {startCase(block.type)}
                </Button>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
});

CreateNodeDropdown.displayName = 'CreateNodeDropdown';
