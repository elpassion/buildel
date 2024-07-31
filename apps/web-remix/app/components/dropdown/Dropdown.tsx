import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  FloatingPortal,
  safePolygon,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
} from '@floating-ui/react-dom';
import type { OffsetOptions, Placement } from '@floating-ui/react-dom';
import { useBoolean, useOnClickOutside } from 'usehooks-ts';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

import { DropdownContext, useDropdown } from './DropdownContext';

export interface DropdownProps {
  defaultShown?: boolean;
  placement?: Placement;
  offset?: OffsetOptions;
  shown?: boolean;
  onClose?: () => void;
  showOnHover?: boolean;
}

export const Dropdown: React.FC<PropsWithChildren<DropdownProps>> = ({
  children,
  defaultShown,
  placement = 'bottom-start',
  offset = 5,
  shown,
  onClose,
  showOnHover = false,
}) => {
  const {
    value: isShown,
    setTrue,
    setFalse,
    toggle,
    setValue,
  } = useBoolean(defaultShown ?? false);

  const floatingContext = useFloating({
    placement,
    middleware: [floatingOffset(offset), flip()],
    whileElementsMounted: autoUpdate,
    open: isShown,
    onOpenChange: setValue,
  });

  const hover = useHover(floatingContext.context, {
    enabled: showOnHover,
    handleClose: safePolygon({
      requireIntent: false,
    }),
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const show = () => {
    setTrue();
  };

  const hide = () => {
    setFalse();
  };

  useOnClickOutside(floatingContext.refs.floating, () => {
    hide();
    onClose?.();
  });

  return (
    <DropdownContext.Provider
      value={{
        isShown: shown ?? isShown,
        hide,
        show,
        toggle,
        context: floatingContext,
        getFloatingProps,
        getReferenceProps,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export type DropdownPopupProps = React.HTMLAttributes<HTMLDivElement>;

export const DropdownPopup: React.FC<DropdownPopupProps> = ({
  children,
  className,
  style,
  ...rest
}) => {
  const { isShown, context, getFloatingProps } = useDropdown();

  return (
    <div
      ref={context.refs.setFloating}
      style={{ ...style, ...context.floatingStyles }}
      {...getFloatingProps?.()}
      className={cn(
        'transition-opacity ',
        {
          'opacity-0 pointer-events-none': !isShown,
          'opacity-100 pointer-events-auto': isShown,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const DropdownTrigger: React.FC<ButtonProps> = ({
  children,
  className,
  onClick,
  ...rest
}) => {
  const { toggle, context, getReferenceProps } = useDropdown();

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    toggle();
    onClick?.(e);
  };

  return (
    <Button
      ref={context.refs.setReference}
      className={cn(className)}
      onClick={handleOnClick}
      {...getReferenceProps?.()}
      {...rest}
    >
      {children}
    </Button>
  );
};

export const DropdownPortal = FloatingPortal;
