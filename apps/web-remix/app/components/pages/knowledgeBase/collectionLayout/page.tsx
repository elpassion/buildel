import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useMatch } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
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
      />

      <PageContentWrapper>
        <TabGroup>
          <div className="flex gap-2 justify-between items-center mt-5">
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
                to={routes.collectionSettings(organizationId, collectionName)}
              >
                Settings
              </FilledTabLink>
            </FilledTabsWrapper>

            <Link to={linkToSearch}>
              <Button size="sm" tabIndex={0}>
                Ask a question
              </Button>
            </Link>
          </div>

          <div className="pt-6">
            <Outlet />
          </div>
        </TabGroup>
      </PageContentWrapper>
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
