'use client';

import React from 'react';
import { Breadcrumbs, Button, Icon } from '@elpassion/taco';
import { ROUTES } from '~/modules/Config';
import { Navbar } from '~/modules/Layout';

interface PipelineNavbarProps {
  name: string;
}

export const PipelineNavbar = ({ name }: PipelineNavbarProps) => {
  return (
    <Navbar
      leftContent={
        <>
          <div className="flex items-center justify-center gap-2">
            <div className="px-1 py-1">
              <Breadcrumbs
                breadcrumbs={[
                  {
                    label: 'Workflows',
                    // TODO (hub33k): get proper org id
                    href: ROUTES.ORGANIZATION_PIPELINES('1'),
                  },
                  {
                    label: name,
                    href: '#',
                  },
                ]}
              />
            </div>
          </div>
        </>
      }
    />
  );
};
