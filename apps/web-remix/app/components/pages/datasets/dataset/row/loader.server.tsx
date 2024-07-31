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
    invariant(params.rowId, 'rowId not found');

    const datasetApi = new DatasetApi(fetch);

    const { data: datasetRow } = await datasetApi.getDatasetRow(
      params.organizationId,
      params.datasetId,
      params.rowId,
    );

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page } = getParamsPagination(searchParams);
    const pagination = { page, per_page };

    return json({
      organizationId: params.organizationId,
      datasetId: params.datasetId,
      rowId: params.rowId,
      row: datasetRow.data,
      pagination,
    });
  })(args);
}
