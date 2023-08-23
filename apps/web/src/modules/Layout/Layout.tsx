'use client';

import React from 'react';
import { LayoutProvider } from '~/modules/Layout/LayoutContext';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutProvider>
      <div className="grid h-screen grid-cols-[auto_1fr]">
        <Sidebar />

        <div className="col-span-2 flex min-h-screen flex-col overflow-x-auto md:col-auto">
          {children}
        </div>
      </div>
    </LayoutProvider>
  );
};
