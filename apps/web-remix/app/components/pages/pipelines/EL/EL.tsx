import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { useDropdown } from '~/components/dropdown/DropdownContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useBreakpoints } from '~/hooks/useBreakpoints';

interface ELProps {}

export const EL = ({ children }: PropsWithChildren<ELProps>) => {
  const { isDesktop } = useBreakpoints();

  return (
    <Dropdown placement={isDesktop ? 'bottom' : 'bottom-start'}>
      <ELTrigger />

      <ElContent>{children}</ElContent>
    </Dropdown>
  );
};

function ElContent({ children }: PropsWithChildren<ELProps>) {
  const { isShown } = useDropdown();

  if (!isShown) return null;

  return (
    <DropdownPopup className="min-w-[100%] z-[11] bg-secondary border border-input rounded-lg overflow-hidden h-[500px] px-1 pb-1 md:min-w-[450px] lg:min-w-[650px]">
      {children}
    </DropdownPopup>
  );
}

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
