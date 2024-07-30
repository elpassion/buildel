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
    invariant(params.blockName, 'blockName not found');

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const enrichedPipelineApi = new EnrichedPipelineApi(
      pipelineApi,
      blockTypeApi,
    );

    const { pipeline } = await enrichedPipelineApi.getEnrichedPipeline(
      params.organizationId,
      params.pipelineId,
      'latest',
    );

    const currentBlock = pipeline.config.blocks.find(
      (block) => block.name === params.blockName,
    );

    if (!currentBlock) {
      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId),
      );
    }

    return json({
      block: currentBlock,
      pipeline: pipeline,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
