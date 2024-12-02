import type { RefObject } from 'react';
import { useCallback } from 'react';

export function useMergedRefs(
  ...refs: Array<React.Ref<any> | undefined | null>
) {
  return useCallback(
    (node: RefObject<any> | null) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      });
    },
    [refs],
  );
}
