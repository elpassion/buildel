'use client';

import React from 'react';
import { ResponsiveSidebar } from '@elpassion/taco';

export const Sidebar = () => {
  return (
    <ResponsiveSidebar
      // TODO (hub33k): fix this is design system
      //   isOpen - is passed to Sidebar
      //   close - hydration error
      // isOpen={isOpen}
      close={close} //  NOTE (hub33k): without this - Warning: Did not expect server HTML to contain a <div> in <div> + Hydration failed
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
