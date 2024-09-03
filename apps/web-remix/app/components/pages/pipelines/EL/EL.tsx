import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';

interface ELProps {}

export const EL = ({ children }: PropsWithChildren<ELProps>) => {
  return (
    <Dropdown placement="bottom">
      <ELTrigger />

      <DropdownPopup className="min-w-[250px] z-[11] bg-white border border-input rounded-lg overflow-hidden p-2 md:min-w-[450px] lg:min-w-[650px]">
        {children}
      </DropdownPopup>
    </Dropdown>
  );
};

function ELTrigger() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <DropdownTrigger
          aria-label="Open EL"
          className="w-7 h-7 p-0"
          variant="ghost"
          asChild
        >
          <TooltipTrigger>✨</TooltipTrigger>
        </DropdownTrigger>
        <TooltipContent className="max-w-[400px]" side="bottom">
          Use EL to build sophisticated workflows that fulfill all your needs.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
