'use client';

import React from 'react';
import { ActionIcon, Text } from '@mantine/core';

interface BlockWrapperProps {
  children: React.ReactNode;
  enabled: boolean;
  name: string;
}

export const BlockWrapper = ({
  children,
  enabled,
  name,
}: BlockWrapperProps) => {
  return (
    <div className="w-full rounded border border-solid border-slate-300 p-4">
      <header className="flex items-center justify-between">
        <Text>{name}</Text>

        {/*<ActionIcon*/}
        {/*  variant="outline"*/}
        {/*  aria-label="Status"*/}
        {/*  color={enabled ? 'green' : 'red'}*/}
        {/*>*/}
        {/*  {enabled ? 'On' : 'Off'}*/}
        {/*</ActionIcon>*/}
      </header>

      <div className="mb-4" />

      <div>{children}</div>
    </div>
  );
};
