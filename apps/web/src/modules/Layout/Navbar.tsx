'use client';

import React from 'react';
import { Button, Navbar as NavbarTaco } from '@elpassion/taco';

export const Navbar = () => {
  return (
    <NavbarTaco
      leftContent={<LeftContent />}
      menuClassName="lg:hidden"
      menuPosition="right"
      className=""
      onMenuClick={function noRefCheck() {}}
    >
      <div className="flex justify-end gap-2">
        <Button size="sm" text="New project" />
      </div>
    </NavbarTaco>
  );
};

function LeftContent() {
  return (
    <>
      <h2 className="text-2xl font-bold text-neutral-500">Projects</h2>
    </>
  );
}
