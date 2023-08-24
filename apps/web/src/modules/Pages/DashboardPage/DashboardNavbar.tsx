'use client';

import React from 'react';
import { Navbar } from '~/modules/Layout';

export const DashboardNavbar = () => {
  return (
    <>
      <Navbar leftContent={<LeftContent />} rightContent={<RightContent />} />
    </>
  );
};

function LeftContent() {
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-2xl font-bold text-neutral-500">Dashboard</h2>
    </div>
  );
}

function RightContent() {
  return <div className="flex items-center justify-end gap-4"></div>;
}
