import type {
  ButtonHTMLAttributes,
  FC,
  MouseEvent,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { useCallback } from 'react';
import { Menu, X } from 'lucide-react';

import type { IconButtonProps } from '~/components/iconButton';
import { cn } from '~/utils/cn';

//Navbar copied from Taco

export interface MenuButtonProps
  extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  isOpen?: boolean;
  openButtonAriaLabel: string;
  closeButtonAriaLabel: string;
  className?: string;
}

type MenuPosition = 'left' | 'right';

interface MenuButtonInterface {
  onMenuClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  menu?: boolean | ReactNode;
  menuPosition?: MenuPosition;
  menuClassName?: string;
  isMenuOpen?: boolean;
  openButtonProps?: Pick<IconButtonProps, 'aria-label'>;
  closeButtonProps?: Pick<IconButtonProps, 'aria-label'>;
}

export interface NavbarProps extends MenuButtonInterface, PropsWithChildren {
  wrapperClassName?: string;
  leftContent?: ReactNode;
  className?: string;
}

const MenuButton: FC<MenuButtonProps> = ({
  isOpen = false,
  openButtonAriaLabel,
  closeButtonAriaLabel,
  className,
  ...rest
}) => {
  return (
    <button
      className={cn('aspect-square w-6', className)}
      {...rest}
      aria-label={isOpen ? closeButtonAriaLabel : openButtonAriaLabel}
    >
      {isOpen ? <X /> : <Menu />}
    </button>
  );
};

export const Navbar: FC<NavbarProps> = (props) => {
  const {
    children,
    className,
    wrapperClassName,
    leftContent,
    menu = true,
    menuPosition = 'right',
    menuClassName,
    isMenuOpen,
    onMenuClick,
    openButtonProps = { 'aria-label': 'open menu' },
    closeButtonProps = { 'aria-label': 'close menu' },
  } = props;

  const renderLeftContent = useCallback(() => {
    if (!leftContent) return null;

    return leftContent;
  }, [leftContent]);

  const renderMenuIcon = useCallback(() => {
    if (!menu) return null;
    if (typeof menu === 'object') return menu;

    return (
      <MenuButton
        onClick={onMenuClick}
        className={menuClassName}
        isOpen={isMenuOpen}
        openButtonAriaLabel={openButtonProps['aria-label']!}
        closeButtonAriaLabel={closeButtonProps['aria-label']!}
      />
    );
  }, [
    menu,
    onMenuClick,
    menuClassName,
    isMenuOpen,
    closeButtonProps,
    openButtonProps,
  ]);

  return (
    <div
      className={cn('h-fit w-full bg-transparent', wrapperClassName)}
      data-testid="navbar"
    >
      <header
        className={cn(
          'flex min-h-[60px] w-full items-center gap-2 px-4 py-3 lg:px-8',
          className,
        )}
      >
        {menuPosition === 'left' ? renderMenuIcon() : null}

        {renderLeftContent()}

        <div className="grow">{children}</div>

        {menuPosition === 'right' ? renderMenuIcon() : null}
      </header>
    </div>
  );
};

export default Navbar;
