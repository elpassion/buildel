import { useCallback } from 'react';
import { useBeforeUnload } from '@remix-run/react';

export const useBeforeUnloadWarning = (showWarning: boolean) => {
  const onBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (showWarning) {
        event.preventDefault();
        event.returnValue = '';
      }
    },
    [showWarning],
  );

  useBeforeUnload(onBeforeUnload);
};
