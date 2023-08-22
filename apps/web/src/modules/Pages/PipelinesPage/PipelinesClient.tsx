'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PipelinesApi } from '~/modules/Api';
import { ROUTES } from '~/modules/Config';
import { PipelinesTable } from './PipelinesTable';

const pipelinesApi = new PipelinesApi();

// TODO (hub33k): add breadcrumbs

export const PipelinesClient = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesApi.getAll(),
  });

  const pipelines = data?.data ?? [];

  return (
    <>
      <p>Pipelines</p>

      {isLoading ? (
        <p className="animate-spins my-4">Loading apps. Please stand by...</p>
      ) : (
        <>
          <div className="mb-4" />

          <PipelinesTable pipelines={pipelines} />
        </>
      )}
    </>
  );
};
