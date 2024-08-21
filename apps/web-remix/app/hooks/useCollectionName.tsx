import { useParams } from '@remix-run/react';

export const useCollectionName = () => {
  const params = useParams();

  const collectionName = params['collectionName'];

  if (!collectionName) {
    throw new Error('Collection Name not found in params');
  }

  return collectionName;
};
