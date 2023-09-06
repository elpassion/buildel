'use client';

import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { organizationsApi } from '~/modules/Api/Organizations/OrganizationsApi';

export const useOrganizationsQuery = (
  queryOptions?: UseQueryOptions<any, any, any, any>,
) => {
  return useQuery(
    ['organizations'],
    async () => {
      return await organizationsApi.getAll();
    },
    {
      ...queryOptions,
    },
  );
};
