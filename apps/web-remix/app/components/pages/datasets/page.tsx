import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useSearchParams } from '@remix-run/react';
import debounce from 'lodash.debounce';

import { SearchInput } from '~/components/form/inputs/search.input.tsx';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Button } from '~/components/ui/button';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { DatasetsList } from './DatasetsList';
import type { loader } from './loader.server';

export function DatasetsPage() {
  const ref = React.useRef<HTMLInputElement>(null);
  const { organizationId, datasets, search } = useLoaderData<typeof loader>();

  const [_, setSearchParams] = useSearchParams();

  const onSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      prev.set('search', e.target.value);

      return prev;
    });
  }, 500);

  const onSearchClear = () => {
    setSearchParams((prev) => {
      prev.delete('search');

      return prev;
    });

    if (ref.current) {
      ref.current.value = '';
      ref.current.focus();
    }
  };

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Datasets</AppNavbarHeading>} />

      <Outlet />

      <PageContentWrapper className="mt-6">
        <div className="mb-10 -mt-1 gap-2 flex justify-end">
          <SearchInput
            placeholder="Search Datasets"
            onClear={onSearchClear}
            onChange={onSearchChange}
            autoFocus={!!search}
            defaultValue={search}
            ref={ref}
          />

          <Button size="sm" asChild>
            <BasicLink to={routes.datasetsNew(organizationId)}>
              New Dataset
            </BasicLink>
          </Button>
        </div>

        <DatasetsList organizationId={organizationId} items={datasets} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Datasets',
    },
  ];
});
