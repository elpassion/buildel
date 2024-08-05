import { useEffect } from 'react';
import { useRevalidator } from '@remix-run/react';

interface Options {
  enabled?: boolean;
  interval?: number;
}

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
}: Options) {
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!enabled) return;
    let intervalId = setInterval(() => {
      revalidator.revalidate();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval]);
}
