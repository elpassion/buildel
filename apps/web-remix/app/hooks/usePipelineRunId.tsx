import { useParams } from '@remix-run/react';

export const usePipelineRunId = () => {
  const params = useParams();

  const runId = params['runId'];

  if (!runId) {
    throw new Error('Pipeline Run ID not found in params');
  }

  return runId;
};
