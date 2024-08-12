import type { PropsWithChildren } from 'react';
import React from 'react';
import { Settings } from 'lucide-react';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';

export const SearchParams: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Dropdown>
      <DropdownTrigger
        type="button"
        className="!min-w-[36px] w-9 h-9 flex justify-center items-center p-0"
        variant="outline"
      >
        <Settings className="min-w-5 w-5 min-h-5 h-5 text-foreground" />
      </DropdownTrigger>

      <DropdownPopup className="bg-white p-2 z-[12] rounded-lg border border-input">
        {children}
      </DropdownPopup>
    </Dropdown>
  );
};
