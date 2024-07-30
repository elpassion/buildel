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
    invariant(params.datasetId, 'datasetId not found');

    const datasetApi = new DatasetApi(fetch);

    const datasetPromise = datasetApi.getDataset(
      params.organizationId,
      params.datasetId,
    );

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);

    const datasetRowsPromise = datasetApi.getDatasetRows(
      params.organizationId,
      params.datasetId,
      { page, per_page, search: search ?? '' },
    );

    const [{ data: dataset }, { data: datasetRows }] = await Promise.all([
      datasetPromise,
      datasetRowsPromise,
    ]);

    const totalItems = datasetRows.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      organizationId: params.organizationId,
      datasetId: params.datasetId,
      dataset: dataset.data,
      datasetRows: datasetRows,
      pagination,
    });
  })(args);
}
