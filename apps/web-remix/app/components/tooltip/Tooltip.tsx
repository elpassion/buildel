import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import type { ITooltip } from 'react-tooltip';

import { cn } from '~/utils/cn';

export const Tooltip: React.FC<ITooltip> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ReactTooltip
      place="right"
      openOnClick={false}
      className={cn('!text-white !py-1 !px-2 !z-[30]', className)}
      {...props}
    >
      {children}
    </ReactTooltip>
  );
};
