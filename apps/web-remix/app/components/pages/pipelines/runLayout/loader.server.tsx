import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { getServerToast } from '~/utils/toast.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');
    invariant(params.runId, 'runId not found');

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      pipelineApi.getAliasFromUrl(request.url),
    );

    const pipelineRunPromise = pipelineApi.getPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId,
    );

    const [blockTypes, pipeline, pipelineRun] = await Promise.all([
      blockTypesPromise,
      pipelinePromise,
      pipelineRunPromise,
    ]);

    const blocks = pipelineRun.data.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type,
      ),
    }));

    const { cookie, ...toasts } = await getServerToast(request);

    return json(
      {
        toasts,
        pipeline,
        pipelineRun: {
          ...pipelineRun.data,
          config: { ...pipelineRun.data.config, blocks },
        },
        runId: params.runId,
        pipelineId: params.pipelineId,
        organizationId: params.organizationId,
      },
      { headers: { 'Set-Cookie': cookie } },
    );
  })(args);
}
