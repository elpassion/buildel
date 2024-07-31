import { useParams } from '@remix-run/react';

export const useDatasetId = () => {
  const params = useParams();

  const datasetId = params['datasetId'];

  if (!datasetId) {
    throw new Error('Dataset ID not found in params');
  }

  return datasetId;
};
