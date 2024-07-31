import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.datasetId, 'datasetId not found');

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page } = getParamsPagination(searchParams);
    const pagination = { page, per_page };

    return json({
      organizationId: params.organizationId,
      datasetId: params.datasetId,
      pagination,
    });
  })(args);
}
