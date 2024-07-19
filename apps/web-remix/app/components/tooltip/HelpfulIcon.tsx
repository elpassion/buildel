import React from 'react';
import type { ITooltip } from 'react-tooltip';
import classNames from 'classnames';
import { CircleHelp } from 'lucide-react';

import { Tooltip } from '~/components/tooltip/Tooltip';

interface HelpfulIconProps {
  text: string;
  id: string;
  className?: string;
  place?: ITooltip['place'];
  size?: 'md' | 'xl' | 'sm';
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
        className={classNames(
          'cursor-pointer',
          {
            'w-6 h-6': size === 'xl',
            'w-5 h-5': size === 'md',
            'w-3.5 h-3.5': size === 'sm',
          },
          className,
        )}
      />
    </>
  );
}
