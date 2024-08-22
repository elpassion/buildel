import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { OrganizationCostTable } from './components/OrganizationCostTable';
import type { loader } from './loader.server';

export function CostsPage() {
  const { organizationId, costs, pagination } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Costs</AppNavbarHeading>} />

      <Outlet />

      <PageContentWrapper className="mt-[110px] pb-3">
        <OrganizationCostTable data={costs} />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.organizationCosts(organizationId)}
          />
        </div>
      </PageContentWrapper>
    </>
  );
}
export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Organization costs',
    },
  ];
});
