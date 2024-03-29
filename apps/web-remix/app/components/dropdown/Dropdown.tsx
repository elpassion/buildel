import React, { PropsWithChildren, useRef } from "react";
import {
  offset as floatingOffset,
  useFloating,
  flip,
  Placement,
  OffsetOptions,
  autoUpdate,
} from "@floating-ui/react-dom";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";

import { DropdownContext, useDropdown } from "./DropdownContext";

interface DropdownProps {
  defaultShown?: boolean;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const Dropdown: React.FC<PropsWithChildren<DropdownProps>> = ({
  children,
  defaultShown,
  placement = "bottom-start",
  offset = 5,
}) => {
  const floatingContext = useFloating({
    placement,
    middleware: [floatingOffset(offset), flip()],
    whileElementsMounted: autoUpdate,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    value: isShown,
    setTrue,
    setFalse,
    toggle,
  } = useBoolean(defaultShown ?? false);

  const show = () => {
    setTrue();
  };

  const hide = () => {
    setFalse();
  };

  useOnClickOutside(wrapperRef, hide);

  return (
    <DropdownContext.Provider
      value={{ isShown, hide, show, toggle, context: floatingContext }}
    >
      <div ref={wrapperRef} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

interface DropdownPopupProps {
  className?: string;
}

export const DropdownPopup: React.FC<PropsWithChildren<DropdownPopupProps>> = ({
  children,
  className,
}) => {
  const { isShown, context } = useDropdown();
  return (
    <div
      ref={context.refs.setFloating}
      style={context.floatingStyles}
      className={classNames(
        "transition-opacity",
        {
          "opacity-0 pointer-events-none": !isShown,
          "opacity-100 pointer-events-auto": isShown,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...rest }) => {
  const { toggle, context } = useDropdown();

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    toggle();
    onClick?.(e);
  };

  return (
    <button
      ref={context.refs.setReference}
      className={classNames(className)}
      onClick={handleOnClick}
      {...rest}
    >
      {children}
    </button>
  );
};
