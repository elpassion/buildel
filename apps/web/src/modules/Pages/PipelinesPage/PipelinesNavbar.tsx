'use client';

import React from 'react';
import { Button, Icon } from '@elpassion/taco';
import { Navbar } from '~/modules/Layout';

export const PipelinesNavbar = () => {
  return (
    <>
      <Navbar leftContent={<LeftContent />} rightContent={<RightContent />} />
    </>
  );
};

function LeftContent() {
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-2xl font-bold text-neutral-500">Workflows</h2>

      <Icon iconName="help-circle" className="font-bold text-primary-500" />
    </div>
  );
}

function RightContent() {
  return (
    <div className="flex items-center justify-end gap-4">
      <Button text="Click me" size={'sm'} />
    </div>
  );
}
