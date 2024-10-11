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

    const searchParams = new URL(request.url).searchParams;
    const blockName = searchParams.get('block_name') ?? undefined;
    const after = searchParams.get('after') ?? undefined;
    const per_page = searchParams.get('per_page') ?? undefined;

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const enrichedPipelineApi = new EnrichedPipelineApi(
      pipelineApi,
      blockTypeApi,
    );

    const pipelinePromise = enrichedPipelineApi.getEnrichedPipeline(
      params.organizationId,
      params.pipelineId,
    );

    const pipelineRunPromise = enrichedPipelineApi.getEnrichedPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId,
    );

    const pipelineRunLogsPromise = pipelineApi.getPipelineRunLogs(
      params.organizationId,
      params.pipelineId,
      params.runId,
      {
        block_name: blockName,
        after,
        per_page,
      },
    );

    const [{ pipeline }, { pipelineRun }, { data: pipelineRunLogs }] =
      await Promise.all([
        pipelinePromise,
        pipelineRunPromise,
        pipelineRunLogsPromise,
      ]);

    return json({
      pipeline,
      pipelineRun,
      logs: pipelineRunLogs.data,
      pagination: pipelineRunLogs.meta,
      blockName,
    });
  })(args);
}
