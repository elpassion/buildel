'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import classNames from 'classnames';
import { Avatar, Icon } from '@elpassion/taco';
import { APP_NAME } from '~/modules/Config';
import { ROUTES } from '~/modules/Config';
import { Sidebar } from './Sidebar';

// const Sidebar = dynamic(
//   () => import('~/modules/Layout/Sidebar').then((c) => c.Sidebar),
//   {
//     ssr: false,
//   },
// );

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="grid h-full grid-cols-[auto_1fr] gap-3">
      <Sidebar />
      <main className="p-4">{children}</main>
    </div>
  );

  return (
    <div>
      <header
        className={classNames([
          'fixed top-0 z-50 h-16 w-full px-6',
          'flex flex-row flex-wrap items-center justify-between',
          'border-b border-gray-300 bg-white',
        ])}
      >
        <div className="flex flex-none flex-row items-center">
          <strong className="flex-1 capitalize">
            <Link href={ROUTES.HOME}>{APP_NAME}</Link>
          </strong>
        </div>

        <div>
          <ul className="relative z-10 flex items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
            <li>
              <Avatar />
            </li>
          </ul>
        </div>
      </header>

      <div className="flex h-screen flex-row flex-wrap">
        <div
          className={classNames([
            'fixed top-0 z-30 h-screen w-64 p-6',
            'flex flex-none flex-col flex-wrap',
            'border-r border-gray-300 bg-white',
            'shadow-xl',
          ])}
        >
          <div className="mt-16" />
          <div className="flex flex-col">
            <Link
              href={ROUTES.HOME}
              className="mb-3 text-sm font-medium capitalize transition duration-500 ease-in-out hover:text-teal-600"
            >
              Home
            </Link>
            <Link
              href={ROUTES.TALK_TO_ME}
              className="mb-3 text-sm font-medium capitalize transition duration-500 ease-in-out hover:text-teal-600"
            >
              Talk to me
            </Link>
          </div>
        </div>

        <main className="ml-64 mt-16 flex-1 bg-gray-100 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Layout), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center text-center">
      <Icon size="lg" iconName="loader" className="animate-spin" />
    </div>
  ),
});
