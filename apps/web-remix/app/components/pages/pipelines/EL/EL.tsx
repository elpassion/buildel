import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';

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
    <DropdownTrigger
      aria-label="Open EL"
      className="w-8 h-8 p-0"
      variant="default"
    >
      ✨
    </DropdownTrigger>
  );
}
