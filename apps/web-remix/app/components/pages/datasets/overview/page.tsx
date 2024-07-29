import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';

import type { loader } from './loader.server';

export function DatasetPage() {
  const { dataset, datasetRows } = useLoaderData<typeof loader>();
  console.log(datasetRows);
  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>Dataset {dataset.name}</AppNavbarHeading>
        }
      />

      <PageContentWrapper className="mt-6">
        <p>AAA {dataset.id}</p>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Dataset ${data?.dataset.name}`,
    },
  ];
};
