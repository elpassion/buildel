import type { PropsWithChildren, ReactElement } from 'react';
import { cloneElement, isValidElement } from 'react';

import { useDropdown } from '~/components/dropdown/DropdownContext';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

import type { DropdownPopupProps, DropdownProps } from './Dropdown';
import {
  Dropdown,
  DropdownPopup,
  DropdownPortal,
  DropdownTrigger,
} from './Dropdown';

const MenuDropdown = ({ ...rest }: PropsWithChildren<DropdownProps>) => {
  return <Dropdown placement="bottom" {...rest} />;
};

const MenuDropdownTrigger = (props: ButtonProps) => {
  return <DropdownTrigger variant="ghost" size="sm" {...props} />;
};

const MenuDropdownContent = ({ className, ...rest }: DropdownPopupProps) => {
  const { isShown } = useDropdown();

  if (!isShown) return null;

  return (
    <DropdownPortal>
      <DropdownPopup
        className={cn(
          'min-w-fit z-[11] bg-white border border-input rounded-md overflow-hidden p-1 flex flex-col',
          className,
        )}
        {...rest}
      />
    </DropdownPortal>
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
