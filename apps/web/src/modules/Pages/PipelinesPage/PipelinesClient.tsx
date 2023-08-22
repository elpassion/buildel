'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader } from '~/components';
import { PipelinesApi } from '~/modules/Api';
import { CreatePipelineForm } from '~/modules/Pipelines';
import { PipelinesTable } from './PipelinesTable';

const pipelinesApi = new PipelinesApi();

export const PipelinesClient = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesApi.getAll(),
  });

  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <p className="text-center font-bold text-red-500">
          Oops! Something went wrong!
        </p>
      </>
    );
  }

  const pipelines = data?.data ?? [];

  if (!pipelines.length) {
    return (
      <>
        <CreatePipelineForm />
      </>
    );
  }

  return (
    <>
      <PipelinesTable pipelines={pipelines} />
    </>
  );
};
