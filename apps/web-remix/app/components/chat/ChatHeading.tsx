import type { PropsWithChildren } from 'react';
import React from 'react';

export const ChatHeading: React.FC<PropsWithChildren> = ({ children }) => {
  return <h3 className="flex gap-2 items-center text-white">{children}</h3>;
};
