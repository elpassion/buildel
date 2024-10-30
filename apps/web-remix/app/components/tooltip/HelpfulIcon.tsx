import React from 'react';
import type { ITooltip } from 'react-tooltip';
import { CircleHelp } from 'lucide-react';

import { Tooltip } from '~/components/tooltip/Tooltip';
import { cn } from '~/utils/cn';

interface HelpfulIconProps {
  text: string;
  id: string;
  className?: string;
  place?: ITooltip['place'];
  size?: 'md' | 'xl' | 'sm' | 'xs';
}

export function HelpfulIcon({
  className,
  place = 'bottom',
  size = 'xl',
  text,
  id,
}: HelpfulIconProps) {
  return (
    <>
      <Tooltip
        anchorSelect={`#${id}-helpful-icon`}
        content={text}
        className="!text-xs max-w-[350px] "
        place={place}
      />

      <CircleHelp
        id={`${id}-helpful-icon`}
        className={cn(
          'cursor-pointer',
          {
            'w-6 h-6': size === 'xl',
            'w-5 h-5': size === 'md',
            'w-3.5 h-3.5': size === 'sm',
            'w-3 h-3': size === 'xs',
          },
          className,
        )}
      />
    </>
  );
}
