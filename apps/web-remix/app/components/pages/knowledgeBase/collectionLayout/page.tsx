import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { FilledTabLink } from '~/components/tabs/FilledTabLink';
import { FilledTabsWrapper } from '~/components/tabs/FilledTabsWrapper';
import { TabGroup } from '~/components/tabs/TabGroup';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function KnowledgeBaseCollectionLayout() {
  const { organizationId, collectionName } = useLoaderData<typeof loader>();
  const matchContent = useMatch(
    routes.collectionFiles(organizationId, collectionName),
  );

  const linkToSearch = !matchContent
    ? routes.collectionInterfaceSearch(organizationId, collectionName)
    : routes.collectionSearch(organizationId, collectionName);

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>{collectionName} Database</AppNavbarHeading>
        }
      >
        <Button asChild className="w-fit ml-auto mr-0 hidden lg:flex">
          <BasicLink to={linkToSearch}>Ask a question</BasicLink>
        </Button>
      </AppNavbar>

      <TabGroup>
        <PageContentWrapper className="mt-6">
          <div className="flex gap-2 justify-between items-center flex-wrap">
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

            <Button asChild className="w-fit lg:hidden">
              <BasicLink to={linkToSearch}>Ask a question</BasicLink>
            </Button>
          </div>
        </PageContentWrapper>

        <div className="pt-3 lg:pt-6">
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
