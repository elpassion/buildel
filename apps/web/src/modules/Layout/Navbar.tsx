'use client';

import React from 'react';
import { Navbar as NavbarTaco } from '@elpassion/taco';
import { useLayout } from '~/modules/Layout/LayoutContext';

interface NavbarProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const Navbar = ({ leftContent, rightContent }: NavbarProps) => {
  const [{ isSidebarOpen }, layoutDispatch] = useLayout();

  return (
    <NavbarTaco
      leftContent={leftContent}
      menuClassName="md:hidden"
      isMenuOpen={isSidebarOpen}
      menuPosition="right"
      onMenuClick={function noRefCheck() {
        layoutDispatch({ type: 'toggleSidebar' });
      }}
    >
      {rightContent}
    </NavbarTaco>
  );
};
