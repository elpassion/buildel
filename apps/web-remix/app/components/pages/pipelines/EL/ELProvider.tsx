import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { useBoolean } from 'usehooks-ts';

interface IELContext {
  isShown: boolean;
  show: () => void;
  hide: () => void;
}

const ELContext = React.createContext<IELContext>(undefined!);

export const ELProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { value: isShown, setTrue: show, setFalse: hide } = useBoolean();

  const value = useMemo(
    () => ({
      isShown,
      show,
      hide,
    }),
    [show, hide, isShown],
  );

  return <ELContext.Provider value={value}>{children}</ELContext.Provider>;
};

export function useEl() {
  const ctx = React.useContext(ELContext);

  if (!ctx) throw new Error('useEl have to be used inside ElProvider');

  return ctx;
}
