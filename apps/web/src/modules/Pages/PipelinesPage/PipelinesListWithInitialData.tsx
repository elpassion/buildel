import React from 'react';
import { Hydrate, dehydrate } from '@tanstack/react-query';
import { PipelinesApi } from '~/modules/Api';
import { getQueryClient } from '~/utils/queryClient';
import { withSSRSession } from '~/utils/withSSRSession';
import { PipelinesList } from './PipelinesList';

const PipelinesListWithInitialData = async ({ serverHttpClient }: any) => {
  const pipelinesApi = new PipelinesApi(serverHttpClient);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(['pipelines'], () =>
    pipelinesApi.getAll('1'),
  );
  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <PipelinesList />
    </Hydrate>
  );
};

export default withSSRSession(PipelinesListWithInitialData);
