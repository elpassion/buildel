'use client';

import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { organizationsApi } from '~/modules/Api/Organizations/OrganizationsApi';

export const organizationsKeys = () => {
  return {
    organizations: ['organizations'],
  };
};
export const useOrganizationsQuery = (
  queryOptions?: UseQueryOptions<any, any, any, any>,
) => {
  return useQuery(
    organizationsKeys().organizations,
    async () => {
      return await organizationsApi.getAll();
    },
    {
      ...queryOptions,
    },
  );
};
