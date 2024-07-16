import type { PropsWithChildren } from 'react';
import React from 'react';

export const FilledTabsWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="bg-neutral-800 flex gap-2 rounded-lg w-fit p-1">
      {children}
    </div>
  );
};
