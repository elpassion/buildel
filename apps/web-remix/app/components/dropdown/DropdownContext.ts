import React from 'react';
import type { UseFloatingReturn } from '@floating-ui/react-dom';

export interface IDropdownContext {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isShown: boolean;
  context: UseFloatingReturn;
  getReferenceProps?: (
    userProps?: React.HTMLProps<Element>,
  ) => Record<string, unknown>;
  getFloatingProps?: (
    userProps?: React.HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
}

export const DropdownContext = React.createContext<
  IDropdownContext | undefined
>(undefined);

export const useDropdown = () => {
  const ctx = React.useContext(DropdownContext);

  if (!ctx)
    throw new Error('useDropdown can be used only inside Dropdown component');

  return ctx;
};
