import { useParams } from '@remix-run/react';

export const usePipelineId = () => {
  const params = useParams();

  const pipelineId = params['pipelineId'];

  if (!pipelineId) {
    throw new Error('Pipeline ID not found in params');
  }

  return pipelineId;
};
