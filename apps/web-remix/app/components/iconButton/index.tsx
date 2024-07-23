import type { ReactElement, ReactNode } from 'react';
import React, { cloneElement, isValidElement, useMemo } from 'react';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

type IconButtonSize = 'xxxs' | 'xxs' | 'xs' | 'sm' | 'lg';

export type IconButtonProps = Omit<ButtonProps, 'size' | 'children'> & {
  onlyIcon?: boolean;
  size?: IconButtonSize;
  icon: ReactNode;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ onlyIcon = false, className, size, icon, ...props }, ref) => {
    const additionalClassNames = useMemo(() => {
      if (onlyIcon) {
        return '!bg-transparent !border-none  transition';
      }
      return '';
    }, [onlyIcon]);

    const modifiedIcon = isValidElement(icon)
      ? cloneElement(icon, {
          // @ts-ignore
          className: cn(
            getIconSize(size),
            (icon as ReactElement).props.className,
          ),
        })
      : icon;

    return (
      <Button
        ref={ref}
        size="icon"
        className={cn(additionalClassNames, getSize(size), className)}
        {...props}
      >
        {modifiedIcon}
      </Button>
    );
  },
);

function getSize(size?: IconButtonSize) {
  switch (size) {
    case 'xxxs':
      return 'min-h-5 h-5 min-w-5 w-5';
    case 'xxs':
      return 'min-h-7 h-7 min-w-7 w-7';
    case 'xs':
      return 'min-h-8 h-8 min-w-8 w-8';
    case 'sm':
      return 'min-h-9 h-9 min-w-9 w-9';
    case 'lg':
      return 'min-h-11 h-11 min-w-11 w-11';
    default:
      return 'min-h-10 h-10 min-w-10 w-10';
  }
}

function getIconSize(size?: IconButtonSize) {
  switch (size) {
    case 'xxxs':
      return 'h-3 w-3';
    case 'xxs':
      return 'h-3.5 w-3.5';
    case 'xs':
      return 'h-4 w-4';
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-6 w-6';
    default:
      return 'h-5 w-5';
  }
}
IconButton.displayName = 'IconButton';
