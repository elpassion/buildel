import React from 'react';
import { PipelinesApi } from '~/modules/Api';
import { withSSRSession } from '~/utils/withSSRSession';
import { PipelinesList } from './PipelinesList';

interface PipelinesListWrapperProps {}

const PipelinesListWithInitialData = async ({ serverHttpClient }: any) => {
  const pipelinesApi = new PipelinesApi(serverHttpClient);
  const pipelines = await pipelinesApi.getAll('1').catch();

  return <PipelinesList initialData={pipelines} />;
};

export default withSSRSession(PipelinesListWithInitialData);
