'use client';

import React from 'react';
import { Button, Navbar as NavbarTaco } from '@elpassion/taco';
import { useLayout } from '~/modules/Layout/LayoutContext';

export const Navbar = () => {
  const [{ isSidebarOpen }, layoutDispatch] = useLayout();

  return (
    <NavbarTaco
      leftContent={<LeftContent />}
      menuClassName="md:hidden"
      isMenuOpen={isSidebarOpen}
      menuPosition="right"
      className=""
      onMenuClick={function noRefCheck() {
        layoutDispatch({ type: 'toggleSidebar' });
      }}
    >
      <div className="flex justify-end gap-2">
        <Button size="sm" text="New project" />
      </div>
    </NavbarTaco>
  );
};

function LeftContent() {
  // TODO (hub33k): change it based on route
  return (
    <>
      <h2 className="text-2xl font-bold text-neutral-500">Pipelines</h2>
    </>
  );
}
