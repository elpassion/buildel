import { useParams } from '@remix-run/react';

export const useOrganizationId = () => {
  const params = useParams();

  const organizationId = params['organizationId'];

  if (!organizationId) {
    throw new Error('Organization ID not found in params');
  }

  return organizationId;
};
