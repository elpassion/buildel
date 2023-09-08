'use client';

import React from 'react';
import { Icon } from '@elpassion/taco';
import { useAuthUser } from '~/app/(protected)/AuthProvider';
import { Navbar } from '~/modules/Layout';

export const PipelinesNavbar = () => {
  return (
    <>
      <Navbar leftContent={<LeftContent />} rightContent={<RightContent />} />
    </>
  );
};

function LeftContent() {
  const { user } = useAuthUser();
  console.log(user);
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-2xl font-bold text-neutral-500">Workflows</h2>

      <Icon iconName="help-circle" className="font-bold text-primary-500" />

      <p>User id: {user.id}</p>
    </div>
  );
}

function RightContent() {
  return <div className="flex items-center justify-end gap-4"></div>;
}
