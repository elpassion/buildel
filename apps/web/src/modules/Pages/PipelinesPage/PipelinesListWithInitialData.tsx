import React from 'react';
import { withSSRSession } from '~/app/(protected)/layout';
import { PipelinesApi } from '~/modules/Api';
import { PipelinesList } from './PipelinesList';

interface PipelinesListWrapperProps {}

const PipelinesListWithInitialData = async ({ serverHttpClient }: any) => {
  const pipelinesApi = new PipelinesApi(serverHttpClient);
  const pipelines = await pipelinesApi.getAll('1').catch();

  return <PipelinesList initialData={pipelines} />;
};

export default withSSRSession(PipelinesListWithInitialData);
