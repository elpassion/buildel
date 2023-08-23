'use client';

import React from 'react';
import { ROUTES } from '~/modules/Config';
import { LayoutProvider } from '~/modules/Layout/LayoutContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

type NavigationElementsType = {
  label: string;
  href: string;
  disabled?: boolean;
};
const navigationElements: NavigationElementsType[] = [
  {
    label: 'Home',
    href: ROUTES.HOME,
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutProvider>
      <div className="grid h-screen grid-cols-[auto_1fr]">
        <Sidebar />

        <div className="col-span-2 flex min-h-screen flex-col overflow-x-auto md:col-auto">
          <Navbar />

          <main className="h-fit w-full min-w-0 flex-grow bg-neutral-50">
            <div className="mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
};
