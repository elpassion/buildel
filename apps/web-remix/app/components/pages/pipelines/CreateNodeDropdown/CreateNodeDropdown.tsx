import React, { useMemo } from 'react';
import startCase from 'lodash.startcase';
import { ChevronRight } from 'lucide-react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import type {
  IBlockType,
  IBlockTypes,
} from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
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
  const { status: runStatus } = useRunPipeline();

  const groupsWithSingleItem = useMemo(() => {
    return Object.entries(blockGroups).filter(
      ([_, value]) => value.length === 1,
    );
  }, [blockGroups]);

  const groupsWithMoreItems = useMemo(() => {
    return Object.entries(blockGroups).filter(([_, value]) => value.length > 1);
  }, [blockGroups]);

  if (!open || runStatus !== 'idle') return null;

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bg-white pointer-events-auto z-[50] py-1 px-1 rounded-lg border border-input max-w-[200px] min-w-[200px]',
      )}
      style={{ top: position.y, left: position.x }}
    >
      <ul>
        {groupsWithSingleItem.map(([group, blocks]) => {
          return (
            <li key={group}>
              <Button
                isFluid
                size="xxs"
                variant="ghost"
                className="justify-start"
                onClick={() => create(blocks[0])}
              >
                {startCase(blocks[0].type)}
              </Button>
            </li>
          );
        })}

        {groupsWithMoreItems.map(([group, blocks]) => (
          <li key={group}>
            <Dropdown showOnHover placement="right">
              <DropdownTrigger
                isFluid
                size="xxs"
                variant="ghost"
                className="justify-between"
              >
                <span>{startCase(group)}</span>

                <ChevronRight className="w-3.5 h-3.5" />
              </DropdownTrigger>

              <DropdownPopup>
                <div className="bg-white border border-input rounded-md w-fit p-1 max-w-[200px]">
                  {blocks.map((block) => {
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
                </div>
              </DropdownPopup>
            </Dropdown>
          </li>
        ))}
      </ul>
    </div>
  );
});

CreateNodeDropdown.displayName = 'CreateNodeDropdown';
