'use client';

import React from 'react';

interface BlockWrapperProps {
  children: React.ReactNode;
  name: string;
}

export const BlockWrapper = ({ children, name }: BlockWrapperProps) => {
  return (
    <div className="flex h-full w-full flex-grow flex-col rounded border border-solid border-slate-300 p-4">
      <header className="flex items-center justify-between">
        <p>{name}</p>
      </header>

      <div className="mb-4" />

      <div>{children}</div>
    </div>
  );
};
