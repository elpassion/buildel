'use client';

import React from 'react';
import { Breadcrumbs, Button, Icon } from '@elpassion/taco';
import { ROUTES } from '~/modules/Config';
import { Navbar } from '~/modules/Layout';

export const PipelineNavbar = () => {
  return <Navbar leftContent={<LeftContent />} />;
};

function LeftContent() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="px-1 py-1">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: 'Workflows',
              href: ROUTES.PIPELINES,
            },
            {
              label: 'Workflow name',
              href: '#',
            },
          ]}
        />
      </div>
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
