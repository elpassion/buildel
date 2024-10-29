import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { useDropdown } from '~/components/dropdown/DropdownContext';
import { BasicLink } from '~/components/link/BasicLink';
import { useCurrentPlan } from '~/components/subscription/useCurrentPlan';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { routes } from '~/utils/routes.utils';

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
  const { plan } = useCurrentPlan();
  const organizationId = useOrganizationId();

  if (!isShown) return null;

  return (
    <DropdownPopup className="min-w-[100%] z-[11] bg-secondary border border-input rounded-lg overflow-hidden h-[500px] px-1 pb-1 md:min-w-[450px] lg:min-w-[650px]">
      {!plan.features.el_included ? (
        <p className="text-xs flex justify-center items-center h-full">
          EL is not included in your current plan. Please{' '}
          <BasicLink
            target="_blank"
            className="mx-1 font-bold hover:underline"
            to={routes.billing(organizationId)}
          >
            upgrade
          </BasicLink>{' '}
          to use this feature.
        </p>
      ) : (
        children
      )}
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
