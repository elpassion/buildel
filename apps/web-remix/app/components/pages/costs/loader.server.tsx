import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);

    const organizationApi = new OrganizationApi(fetch);

    const {
      data: { data: costs, meta },
    } = await organizationApi.getCosts(params.organizationId, {
      page,
      per_page,
      search: search ?? '',
    });

    const totalItems = meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      costs,
      organizationId: params.organizationId,
      pagination,
    });
  })(args);
}
