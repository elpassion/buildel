import { useCallback, useEffect, useState } from "react";
import { useCopyToClipboard as tsHooksUseCopyCoClipboard } from "usehooks-ts";

export function useCopyToClipboard(text: string) {
  const [_value, copy] = tsHooksUseCopyCoClipboard();
  const [isCopied, setIsCopied] = useState(false);
  // @ts-ignore
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(async () => {
    await copy(text);
    setIsCopied(true);
    setTimeoutId(setTimeout(() => setIsCopied(false), 2000));
  }, [text, copy]);

  useEffect(() => {
    if (!timeoutId) return;
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return { copy: handleCopy, isCopied };
}
