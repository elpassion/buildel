import type { PropsWithChildren } from 'react';
import React from 'react';
import { Settings } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import {
  Popover,
  PopoverContentWithoutPortal,
  PopoverTrigger,
} from '~/components/ui/popover';

export const SearchParams: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          variant="secondary"
          icon={<Settings className="w-5 h-5 text-foreground" />}
        />
      </PopoverTrigger>

      <PopoverContentWithoutPortal align="start">
        {children}
      </PopoverContentWithoutPortal>
    </Popover>
  );
};
