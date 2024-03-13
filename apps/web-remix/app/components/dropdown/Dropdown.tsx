import React, { PropsWithChildren, useRef } from "react";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";

interface IDropdownContext {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isShown: boolean;
}

const DropdownContext = React.createContext<IDropdownContext | undefined>(
  undefined
);

export const useDropdown = () => {
  const ctx = React.useContext(DropdownContext);

  if (!ctx)
    throw new Error("useDropdown can be used only inside Dropdown component");

  return ctx;
};

interface DropdownProps {
  defaultShown?: boolean;
}

export const Dropdown: React.FC<PropsWithChildren<DropdownProps>> = ({
  children,
  defaultShown,
}) => {
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
    <DropdownContext.Provider value={{ isShown, hide, show, toggle }}>
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
  const { isShown } = useDropdown();
  return (
    <div
      className={classNames(
        "min-w-[250px] absolute z-[11] top-full translate-y-[4px] right-0 bg-neutral-850 border border-neutral-800 rounded-lg overflow-hidden p-2 transition",
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
  const { toggle } = useDropdown();

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    toggle();
    onClick?.(e);
  };

  return (
    <button className={classNames(className)} onClick={handleOnClick} {...rest}>
      {children}
    </button>
  );
};
