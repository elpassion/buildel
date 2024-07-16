import type { PropsWithChildren} from "react";
import React, { useMemo } from "react";
import { useBoolean } from "usehooks-ts";

interface IPasteBlockConfigContext {
  isShown: boolean;
  show: () => void;
  hide: () => void;
}

const PasteBlockConfigContext = React.createContext<IPasteBlockConfigContext>(
  undefined!
);

export const PasteBlockConfigProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const { value: isShown, setTrue: show, setFalse: hide } = useBoolean();

  const value = useMemo(
    () => ({
      isShown,
      show,
      hide,
    }),
    [show, hide, isShown]
  );

  return (
    <PasteBlockConfigContext.Provider value={value}>
      {children}
    </PasteBlockConfigContext.Provider>
  );
};

export function usePasteConfig() {
  const ctx = React.useContext(PasteBlockConfigContext);

  if (!ctx)
    throw new Error(
      "usePasteConfig have to be used inside PasteBlockConfigProvider"
    );

  return ctx;
}
