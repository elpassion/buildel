import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

import { cn } from '~/utils/cn';

export type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>;

const RadioGroup = ({
  ref,
  className,
  ...props
}: RadioGroupProps & {
  ref?: React.RefObject<React.ElementRef<
    typeof RadioGroupPrimitive.Root
  > | null>;
}) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
};
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
>;

const RadioGroupItem = ({
  ref,
  className,
  ...props
}: RadioGroupItemProps & {
  ref?: React.RefObject<React.ElementRef<
    typeof RadioGroupPrimitive.Item
  > | null>;
}) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
};
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioTabGroupItem = ({
  ref,
  className,
  ...props
}: RadioGroupItemProps & {
  ref?: React.RefObject<React.ElementRef<
    typeof RadioGroupPrimitive.Item
  > | null>;
}) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'grow text-sm p-1 data-[state=checked]:bg-white rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {props.value}
    </RadioGroupPrimitive.Item>
  );
};
RadioTabGroupItem.displayName = 'RadioTabGroupItem';

export { RadioGroup, RadioGroupItem, RadioTabGroupItem };
