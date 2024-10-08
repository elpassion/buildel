import React from 'react';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { FilledTabLink } from '~/components/tabs/FilledTabLink';
import { FilledTabsWrapper } from '~/components/tabs/FilledTabsWrapper';
import { TabGroup } from '~/components/tabs/TabGroup';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function SettingsLayout() {
  const { organizationId } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading className="flex gap-3 items-center">
            Settings
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper className="!ml-auto mt-5">
        <TabGroup>
          <FilledTabsWrapper>
            <FilledTabLink to={routes.organizationSettings(organizationId)}>
              Your Organization
            </FilledTabLink>
            <FilledTabLink to={routes.profileSettings(organizationId)}>
              Your Profile
            </FilledTabLink>
            <FilledTabLink to={routes.billing(organizationId)}>
              Billing
            </FilledTabLink>
          </FilledTabsWrapper>

          <div className="mt-10">
            <Outlet />
          </div>
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}
