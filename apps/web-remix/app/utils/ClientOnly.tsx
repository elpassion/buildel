import type { PropsWithChildren } from 'react';
import type React from 'react';
import { useEffect, useState } from 'react';

export const ClientOnly: React.FC<PropsWithChildren> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return children;
};
