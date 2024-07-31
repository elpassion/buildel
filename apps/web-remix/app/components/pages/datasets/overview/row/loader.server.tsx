import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
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

    return json({
      organizationId: params.organizationId,
      datasetId: params.datasetId,
      rowId: params.rowId,
      row: datasetRow.data,
    });
  })(args);
}
