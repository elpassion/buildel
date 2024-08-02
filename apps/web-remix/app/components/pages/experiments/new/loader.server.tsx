import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { DatasetApi } from '~/api/datasets/DatasetApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const pipelineApi = new PipelineApi(fetch);
    const datasetApi = new DatasetApi(fetch);

    const pipelinesPromise = pipelineApi.getPipelines(params.organizationId);
    const datasetsPromise = datasetApi.getDatasets(params.organizationId);

    const [pipelines, datasets] = await Promise.all([
      pipelinesPromise,
      datasetsPromise,
    ]);

    return json({
      organizationId: params.organizationId,
      pipelines: pipelines.data.data,
      datasets: datasets.data.data,
    });
  })(args);
}
