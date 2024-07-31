import type { ReactElement } from 'react';
import { cloneElement, isValidElement } from 'react';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

import type { DropdownPopupProps } from './Dropdown';
import { Dropdown, DropdownPopup, DropdownTrigger } from './Dropdown';

const MenuDropdown = Dropdown;

const MenuDropdownTrigger = (props: ButtonProps) => {
  return <DropdownTrigger variant="ghost" size="sm" {...props} />;
};

const MenuDropdownContent = ({ className, ...rest }: DropdownPopupProps) => {
  return (
    <DropdownPopup
      className={cn(
        'min-w-fit z-[11] bg-white border border-input rounded-md overflow-hidden p-1 flex flex-col',
        className,
      )}
      {...rest}
    />
  );
};

type MenuDropdownItemProps = Omit<ButtonProps, 'variant'> & {
  variant?: 'ghost' | 'destructive';
  icon?: React.ReactNode;
};

const MenuDropdownItem = ({
  className,
  variant = 'ghost',
  icon,
  children,
  ...rest
}: MenuDropdownItemProps) => {
  const modifiedIcon = isValidElement(icon)
    ? cloneElement(icon, {
        // @ts-ignore
        className: cn('w-3.5 h-3.5', (icon as ReactElement).props.className),
      })
    : icon;

  return (
    <Button
      variant="ghost"
      size="xs"
      className={cn(
        'justify-start text-sm gap-2',
        { 'text-red-500': variant === 'destructive' },
        className,
      )}
      {...rest}
    >
      {modifiedIcon}
      {children}
    </Button>
  );
};

export {
  MenuDropdown,
  MenuDropdownTrigger,
  MenuDropdownContent,
  MenuDropdownItem,
};
