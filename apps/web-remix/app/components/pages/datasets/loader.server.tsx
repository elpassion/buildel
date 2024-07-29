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

    const datasetApi = new DatasetApi(fetch);

    const { data: datasets } = await datasetApi.getDatasets(
      params.organizationId,
    );

    return json({
      organizationId: params.organizationId,
      datasets: datasets.data,
    });
  })(args);
}
