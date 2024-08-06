import { useParams } from '@remix-run/react';

export const useExperimentRunId = () => {
  const params = useParams();

  const runId = params['runId'];

  if (!runId) {
    throw new Error('Experiment Run ID not found in params');
  }

  return runId;
};
