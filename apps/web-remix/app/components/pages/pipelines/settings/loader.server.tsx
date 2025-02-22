import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import {
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
} from '~/components/pages/pipelines/MonthPicker/monthPicker.utils';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');
    const blockTypeApi = new BlockTypeApi(fetch);
    const pipelineApi = new PipelineApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      pipelineApi.getAliasFromUrl(request.url),
    );

    const detailsPromise = pipelineApi.getPipelineDetails(
      params.organizationId,
      params.pipelineId,
      { start_date: DEFAULT_START_DATE, end_date: DEFAULT_END_DATE },
    );

    const [pipeline, blockTypes, { data: details }] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
      detailsPromise,
    ]);

    const blocks = pipeline.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type,
      ),
    }));

    return json({
      pipeline: {
        ...pipeline,
        config: { ...pipeline.config, blocks },
      },
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      details,
    });
  })(args);
}
