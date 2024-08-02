import { useParams } from '@remix-run/react';

export const useExperimentId = () => {
  const params = useParams();

  const experimentId = params['experimentId'];

  if (!experimentId) {
    throw new Error('Experiment ID not found in params');
  }

  return experimentId;
};
