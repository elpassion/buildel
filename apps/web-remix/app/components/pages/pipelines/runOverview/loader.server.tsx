import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { EnrichedPipelineApi } from '~/api/EnrichedPipelineApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');
    invariant(params.runId, 'runId not found');

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);
    const enrichedPipelineApi = new EnrichedPipelineApi(
      pipelineApi,
      blockTypeApi,
    );

    const aliasId = pipelineApi.getAliasFromUrl(request.url);

    const enrichedPipelinePromise = enrichedPipelineApi.getEnrichedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId,
    );
    const enrichedPipelineRunPromise =
      enrichedPipelineApi.getEnrichedPipelineRun(
        params.organizationId,
        params.pipelineId,
        params.runId,
      );

    const [{ pipeline, blockTypes }, { pipelineRun }] = await Promise.all([
      enrichedPipelinePromise,
      enrichedPipelineRunPromise,
    ]);

    return json({
      blockTypes,
      pipeline,
      pipelineRun,
    });
  })(args);
}
