import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { ELSettings } from '~/components/pages/settings/organization/ELSettings';
import {
  OutlinedTabLink,
  OutlinedTabsWrapper,
} from '~/components/tabs/OutlinedTabs';
import { TabGroup } from '~/components/tabs/TabGroup';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { AboutOrganization } from './AboutOrganization';
import { ApiKey } from './ApiKey';
import type { loader } from './loader.server';

export function OrganizationSettingsPage() {
  const { apiKey, organization, pipelines } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-9">
      <AboutOrganization organization={organization} />

      <ELSettings organization={organization} pipelines={pipelines} />

      <ApiKey apiKey={apiKey} />

      <div className="mt-6">
        <TabGroup>
          <OutlinedTabsWrapper>
            <OutlinedTabLink
              end
              to={routes.organizationSettings(organization.id)}
            >
              Members
            </OutlinedTabLink>

            <OutlinedTabLink
              to={routes.organizationInvitations(organization.id)}
            >
              Invitations
            </OutlinedTabLink>
          </OutlinedTabsWrapper>

          <div className="pt-8">
            <Outlet />
          </div>
        </TabGroup>
      </div>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Organization settings',
    },
  ];
});
