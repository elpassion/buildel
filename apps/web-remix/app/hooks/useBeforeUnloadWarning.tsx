import { useCallback, useEffect } from "react";

export const useBeforeUnloadWarning = (showWarning: boolean) => {
  const onBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (showWarning) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    [showWarning]
  );

  useEffect(() => {
    if (!window) return;
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [onBeforeUnload]);
};
