import React, { useMemo } from 'react';
import startCase from 'lodash.startcase';
import { ChevronRight } from 'lucide-react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { cn } from '~/utils/cn';

import type { NodeDropdownOption } from './useNodeDropdown';
import { isBlockTypeOption } from './useNodeDropdown';

interface NodeDropdownProps {
  position: { x: number; y: number };
  open: boolean;
  onClick: (option: NodeDropdownOption) => void;
  options: Record<string, NodeDropdownOption[]>;
}

export const NodeDropdown = React.forwardRef<HTMLDivElement, NodeDropdownProps>(
  ({ position, open, options, onClick }, ref) => {
    const { status: runStatus } = useRunPipeline();

    const groupsWithSingleItem = useMemo(() => {
      return Object.entries(options).filter(([_, value]) => value.length === 1);
    }, [options]);

    const groupsWithMoreItems = useMemo(() => {
      return Object.entries(options).filter(([_, value]) => value.length > 1);
    }, [options]);

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
          {groupsWithSingleItem.map(([group, options]) => {
            return (
              <li key={group}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        isFluid
                        size="xxs"
                        variant="ghost"
                        className="justify-start"
                        onClick={() => onClick(options[0])}
                      >
                        {startCase(options[0].type)}
                      </Button>
                    </TooltipTrigger>
                    {isBlockTypeOption(options[0]) && (
                      <TooltipContent side="right" className="max-w-[400px]">
                        {options[0].description}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}

          {groupsWithMoreItems.map(([group, options]) => (
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
                    {options.map((option) => {
                      return (
                        <TooltipProvider key={option.type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                isFluid
                                size="xxs"
                                variant="ghost"
                                className="justify-start"
                                onClick={() => onClick(option)}
                              >
                                {startCase(option.type)}
                              </Button>
                            </TooltipTrigger>
                            {isBlockTypeOption(option) && (
                              <TooltipContent
                                side="right"
                                className="max-w-[400px]"
                              >
                                {option.description}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
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
  },
);

NodeDropdown.displayName = 'NodeDropdown';
