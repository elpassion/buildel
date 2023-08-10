'use client';

import React from 'react';
import { Text } from '@mantine/core';

interface BlockWrapperProps {
  children: React.ReactNode;
  name: string;
}

export const BlockWrapper = ({ children, name }: BlockWrapperProps) => {
  return (
    <div className="flex h-full w-full flex-grow flex-col rounded border border-solid border-slate-300 p-4">
      <header className="flex items-center justify-between">
        <Text>{name}</Text>
      </header>

      <div className="mb-4" />

      <div>{children}</div>
    </div>
  );
};
