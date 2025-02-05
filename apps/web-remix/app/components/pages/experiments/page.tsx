import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { ExperimentsList } from '~/components/pages/experiments/ExperimentsList';
import { PageSearch } from '~/components/search/PageSearch';
import { Button } from '~/components/ui/button';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function ExperimentsPage() {
  const { organizationId, experiments, search } =
    useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Experiments</AppNavbarHeading>}
      />

      <Outlet />

      <PageContentWrapper className="mt-6">
        <div className="mb-10 -mt-1 gap-2 flex justify-end">
          <PageSearch placeholder="Search Experiments" defaultValue={search} />

          <Button size="sm" asChild>
            <BasicLink to={routes.experimentsNew(organizationId)}>
              New Experiment
            </BasicLink>
          </Button>
        </div>

        <ExperimentsList items={experiments} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Experiments',
    },
  ];
});
