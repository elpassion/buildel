import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { FilledTabLink } from '~/components/tabs/FilledTabLink';
import { FilledTabsWrapper } from '~/components/tabs/FilledTabsWrapper';
import { TabGroup } from '~/components/tabs/TabGroup';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function KnowledgeBaseCollectionLayout() {
  const { organizationId, collectionName } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>{collectionName} Database</AppNavbarHeading>
        }
      />

      <TabGroup>
        <PageContentWrapper className="mt-6">
          <div className="w-full overflow-x-auto">
            <FilledTabsWrapper>
              <FilledTabLink
                to={routes.collectionFiles(organizationId, collectionName)}
              >
                Content
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionOverview(organizationId, collectionName)}
              >
                Overview
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionInterface(organizationId, collectionName)}
              >
                Interface
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionGraph(organizationId, collectionName)}
              >
                Graph
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionSettings(organizationId, collectionName)}
              >
                Settings
              </FilledTabLink>
            </FilledTabsWrapper>
          </div>
        </PageContentWrapper>

        <div className="pt-6">
          <Outlet />
        </div>
      </TabGroup>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} database`,
    },
  ];
};
