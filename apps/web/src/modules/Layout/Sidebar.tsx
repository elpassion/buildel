'use client';

import React from 'react';
import { ResponsiveSidebar } from '@elpassion/taco';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ResponsiveSidebar
      isOpen={isOpen}
      close={() => {
        setIsOpen(!isOpen);
      }}
      sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
      drawerClassName="pt-[68px]"
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
      <div>Main</div>
    </div>
  );
}

function SidebarTopContent() {
  return (
    <div className="">
      <div className="p-2">
        <h1 className="text-sm font-medium text-neutral-500">ACME inc.</h1>
      </div>
    </div>
  );
}

function SidebarBottomContent() {
  return (
    <div>
      <h2>Bottom</h2>
    </div>
  );
}
