'use client';

import React from 'react';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Icon,
  LinearProgressBar,
  MenuItem,
  ResponsiveSidebar,
} from '@elpassion/taco';
import { ROUTES } from '~/modules/Config';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ResponsiveSidebar
      isOpen={isOpen}
      close={() => {
        setIsOpen(!isOpen);
      }}
      sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
      collapseBtnClassName="absolute top-14 -right-2"
      topContent={<SidebarTopContent />}
      bottomContent={<SidebarBottomContent />}
    >
      <SidebarMainContent />
    </ResponsiveSidebar>
  );
};

function SidebarMainContent() {
  return (
    <div>
      <div className="mt-1" />
      <Link href={ROUTES.HOME}>
        <MenuItem text="Dashboard" leftIcon={<Icon iconName="home" />} />
      </Link>
      <div>
        <Link href={ROUTES.PROJECTS}>
          <MenuItem
            text="Projects"
            leftIcon={<Icon iconName="three-layers" />}
            rightIcon={<Icon iconName="chevron-up" />}
          />
        </Link>
        <div className="ml-4">
          <Link href={ROUTES.PROJECT('1')}>
            <MenuItem text="Project 1" />
          </Link>
          <Link href={ROUTES.PROJECT('2')}>
            <MenuItem text="Project 2" />
          </Link>
          <Link href={ROUTES.PROJECT('3')}>
            <MenuItem text="Project 3" />
          </Link>
        </div>
      </div>
      <MenuItem
        text="My local repos"
        leftIcon={<Icon iconName="briefcase" />}
        rightIcon={<Icon iconName="chevron-down" />}
      />
    </div>
  );
}

function SidebarTopContent() {
  return (
    <div className="min-h-smNavbar border-b">
      <div className="flex h-full w-full items-center">
        <h1 className="font-medium text-neutral-500">
          <Link href={ROUTES.HOME}>ACME inc.</Link>
        </h1>
      </div>
    </div>
  );
}

function SidebarBottomContent() {
  return (
    <div>
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

      <div className="mt-4 flex flex-col gap-4 border-b pb-4">
        <MenuItem text="Support" leftIcon={<Icon iconName="life-buoy" />} />
        <MenuItem text="Settings" leftIcon={<Icon iconName="settings" />} />
      </div>

      <div className="mt-4 flex items-center justify-between pb-4">
        <Link href="#profile">
          <Avatar
            alt="Anna Kapusta"
            caption="anna@kapusta.pl"
            contentType="text"
            label="Anna Kapusta"
            name="Anna Kapusta"
            shape="circle"
            size="md"
          />
        </Link>

        <Link href="#log-out">
          <Icon iconName="log-out" />
        </Link>
      </div>
    </div>
  );
}
