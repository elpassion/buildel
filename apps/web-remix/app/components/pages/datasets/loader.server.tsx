import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    const searchParams = new URL(request.url).searchParams;

    const datasetApi = new DatasetApi(fetch);

    const { search } = getParamsPagination(searchParams);

    const { data: datasets } = await datasetApi.getDatasets(
      params.organizationId,
      { search },
    );

    return json({
      organizationId: params.organizationId,
      datasets: datasets.data,
      search,
    });
  })(args);
}
