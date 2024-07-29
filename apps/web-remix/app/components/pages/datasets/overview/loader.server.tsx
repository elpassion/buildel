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

    const datasetApi = new DatasetApi(fetch);

    const datasetPromise = datasetApi.getDataset(
      params.organizationId,
      params.datasetId,
    );

    const datasetRowsPromise = datasetApi.getDatasetRows(
      params.organizationId,
      params.datasetId,
    );

    const [{ data: dataset }, { data: datasetRows }] = await Promise.all([
      datasetPromise,
      datasetRowsPromise,
    ]);

    return json({
      organizationId: params.organizationId,
      datasetId: params.datasetId,
      dataset: dataset.data,
      datasetRows: datasetRows,
    });
  })(args);
}
