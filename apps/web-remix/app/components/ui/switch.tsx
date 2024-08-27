import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '~/utils/cn';

type SwitchSize = 'sm';

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  size?: SwitchSize;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      getWrapperSize(size),
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform  data-[state=unchecked]:translate-x-0',
        getThumpSize(size),
        {},
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

function getWrapperSize(size?: SwitchSize) {
  switch (size) {
    case 'sm':
      return 'h-5 w-9';
    default:
      return 'h-6 w-11';
  }
}

function getThumpSize(size?: SwitchSize) {
  switch (size) {
    case 'sm':
      return 'h-4 w-4 data-[state=checked]:translate-x-4';
    default:
      return 'h-5 w-5 data-[state=checked]:translate-x-5';
  }
}
