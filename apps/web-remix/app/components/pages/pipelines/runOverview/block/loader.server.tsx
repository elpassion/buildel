import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { EnrichedPipelineApi } from '~/api/EnrichedPipelineApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { routes } from '~/utils/routes.utils';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');
    invariant(params.runId, 'runId not found');
    invariant(params.blockName, 'blockName not found');

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const enrichedPipelineApi = new EnrichedPipelineApi(
      pipelineApi,
      blockTypeApi,
    );

    const { pipelineRun } = await enrichedPipelineApi.getEnrichedPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId,
    );

    const currentBlock = pipelineRun.config.blocks.find(
      (block) => block.name === params.blockName,
    );

    if (!currentBlock) {
      return redirect(
        routes.pipelineRunOverview(
          params.organizationId,
          params.pipelineId,
          params.runId,
        ),
      );
    }

    return json({
      pipelineRun,
      block: currentBlock,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
      runId: params.runId,
    });
  })(args);
}
