import React from 'react';
import { pipelinesApi } from '~/modules/Api';
import { PipelinesList } from '~pages/PipelinesPage/PipelinesList';

interface PipelinesListWrapperProps {}

export const PipelinesListWrapper: React.FC<
  PipelinesListWrapperProps
> = async () => {
  const pipelines = await pipelinesApi.getAll('1');

  return <PipelinesList initialData={pipelines} />;
};
