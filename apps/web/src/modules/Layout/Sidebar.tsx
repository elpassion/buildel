'use client';

import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { Icon } from '@elpassion/taco';
import { APP_NAME, ROUTES } from '~/modules/Config';

const navigationElements = [
  {
    label: 'Home',
    href: ROUTES.HOME,
    icon: 'home',
  },
  {
    label: 'Talk to me',
    href: ROUTES.TALK_TO_ME,
    icon: 'mic',
  },
] as const;

export const Sidebar = () => {
  return (
    <div
      className={classNames([
        'sticky left-0 top-0 h-screen w-72 p-4',
        'overflow-auto',
        'border-r',
      ])}
    >
      <div className="border-b pb-4 pt-2">
        <h1 className="text-center text-xl">
          <Link href={ROUTES.HOME}>{APP_NAME}</Link>
        </h1>
      </div>

      <div className="mb-4" />

      <ul className="flex flex-col gap-4">
        {navigationElements.map((el) => (
          <li key={el.href}>
            <Link
              href={el.href}
              className={classNames([
                'flex w-full items-center gap-3',
                'rounded py-2 pl-2',
                'bold text-slate-800',
                'hover:bg-slate-100',
              ])}
            >
              <Icon iconName={el.icon} />
              {el.label}
            </Link>
          </li>
        ))}
      </ul>

      {/*{Array.from({ length: 100 }).map((_, i) => {*/}
      {/*  return <p key={i}>item {i + 1}</p>;*/}
      {/*})}*/}
    </div>
  );
};

function SidebarHeader() {
  return (
    <header className="flex justify-center border-b py-4">
      <h1 className="text-xl">
        <Link href={ROUTES.HOME}>{APP_NAME}</Link>
      </h1>
    </header>
  );
}
