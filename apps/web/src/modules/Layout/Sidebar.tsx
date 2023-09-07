'use client';

import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
import {
  Avatar,
  Button,
  Icon,
  LinearProgressBar,
  MenuItem,
  ResponsiveSidebar,
} from '@elpassion/taco';
import { ROUTES } from '~/modules/Config';
import { useLayout } from '~/modules/Layout/LayoutContext';
import { useBreakpoints, useIsomorphicLayoutEffect } from '~/utils/hooks';

const mainNavItems = [
  {
    text: 'Dashboard',
    href: ROUTES.HOME,
    icon: 'home',
  },
  {
    text: 'Organizations',
    href: ROUTES.ORGANIZATIONS,
    icon: 'three-layers',
  },
] as const;

export const Sidebar = () => {
  const { matchesDesktop, matchesTablet } = useBreakpoints();

  const [{ isSidebarOpen, isSidebarCollapsed }, layoutDispatch] = useLayout();

  useIsomorphicLayoutEffect(() => {
    if (matchesDesktop) {
      layoutDispatch({
        type: 'toggleSidebarCollapse',
        isSidebarCollapsed: false,
      });
    }
    if (matchesTablet) {
      layoutDispatch({
        type: 'toggleSidebarCollapse',
        isSidebarCollapsed: true,
      });
    }
  }, [matchesDesktop, matchesTablet]);

  return (
    <ResponsiveSidebar
      isOpen={isSidebarOpen}
      close={() => {
        layoutDispatch({ type: 'toggleSidebar', isSidebarOpen: false });
      }}
      collapsed={isSidebarCollapsed}
      defaultCollapsed={isSidebarCollapsed}
      onCollapse={() => {
        layoutDispatch({ type: 'toggleSidebarCollapse' });
      }}
      sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
      collapseBtnClassName="absolute top-11 -right-2"
      topContent={<SidebarTopContent />}
    >
      <SidebarMainContent />
    </ResponsiveSidebar>
  );
};

function SidebarMainContent() {
  const [{ isSidebarOpen, isSidebarCollapsed }] = useLayout();
  const isCollapsed = isSidebarCollapsed && !isSidebarOpen;

  return (
    <div>
      <div className="mt-1" />

      <div
        className={classNames([
          'flex flex-col',
          isCollapsed && 'items-center justify-center',
        ])}
      >
        {/*{mainNavItems.map((item) => {*/}
        {/*  return (*/}
        {/*    <Link key={item.text} href={item.href}>*/}
        {/*      <MenuItem*/}
        {/*        text={item.text}*/}
        {/*        middleIcon={*/}
        {/*          <Icon iconName={item.icon} size={'md'} title={item.text} />*/}
        {/*        }*/}
        {/*        variant={isCollapsed ? 'onlyIcon' : 'fitWidth'}*/}
        {/*      />*/}
        {/*    </Link>*/}
        {/*  );*/}
        {/*})}*/}
      </div>
    </div>
  );
}

function SidebarTopContent() {
  const [{ isSidebarOpen, isSidebarCollapsed }] = useLayout();
  const isCollapsed = isSidebarCollapsed && !isSidebarOpen;

  const name = 'ACME inc.';

  return (
    <div className="min-h-smNavbar border-b">
      <div
        className={classNames([
          'flex h-full w-full items-center',
          isCollapsed && 'justify-center text-2xl',
        ])}
      >
        <h1 className="font-medium text-neutral-500">
          <Link href={ROUTES.HOME}>{isCollapsed ? name.at(0) : name}</Link>
        </h1>
      </div>
    </div>
  );
}

function SidebarBottomContent() {
  const [{ isSidebarOpen, isSidebarCollapsed }] = useLayout();
  const isCollapsed = isSidebarCollapsed && !isSidebarOpen;

  return (
    <div>
      {!isCollapsed && (
        <div className="border-b pb-4">
          <p className="text-sm font-medium text-neutral-500">Credit usage</p>
          <div className="mb-2" />
          <LinearProgressBar progress={49.8} label="none" />
          <div className="mb-2" />
          <p className="text-xs font-medium text-neutral-500">
            $2.49 / $5.00 this month
          </p>
          <div className="mb-3" />
          <Button text="Top up" isFluid />
        </div>
      )}

      <div
        className={classNames([
          'mt-4 flex flex-col gap-4 border-b pb-4',
          isCollapsed && 'items-center justify-center',
        ])}
      >
        <MenuItem
          text="Support"
          middleIcon={<Icon iconName="life-buoy" size={'md'} title="Support" />}
          variant={isCollapsed ? 'onlyIcon' : 'fitWidth'}
        />
        <MenuItem
          text="Settings"
          middleIcon={<Icon iconName="settings" size={'md'} title="Settings" />}
          variant={isCollapsed ? 'onlyIcon' : 'fitWidth'}
        />
      </div>

      <div
        className={twMerge(
          'mt-4 flex items-center justify-between pb-4',
          isCollapsed && 'justify-center',
        )}
      >
        <Link href="#profile">
          <Avatar
            alt="Anna Kapusta"
            caption={!isCollapsed && 'anna@kapusta.pl'}
            contentType="text"
            label={!isCollapsed && 'Anna Kapusta'}
            name="Anna Kapusta"
            shape="circle"
            size="md"
          />
        </Link>

        {!isCollapsed && (
          <Link href="#log-out">
            <Icon iconName="log-out" />
          </Link>
        )}
      </div>
    </div>
  );
}
