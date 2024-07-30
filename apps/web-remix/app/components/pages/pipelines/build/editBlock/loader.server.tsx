import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import type { IIOType } from '~/components/pages/pipelines/pipeline.types';
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

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId,
    );

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const [pipeline, blockTypes] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
    ]);

    // const blocks = pipeline.data.config.blocks.map((block) => ({
    //   ...block,
    //   block_type: blockTypes.data.find(
    //     (blockType) => blockType.type === block.type,
    //   ),
    // }));

    const blocks = await Promise.all(
      pipeline.data.config.blocks.map(async (block) => {
        const blockType = blockTypes.data.find(
          (blockType) => blockType.type === block.type,
        );
        if (!blockType) return block;

        if (blockType.dynamic_ios && block.opts.workflow) {
          const { data: dynamicIOs } = await blockTypeApi.getBlockDynamicIOs(
            prepareIOsUrl(blockType.dynamic_ios, {
              organization_id: params.organizationId as string,
              'opts.workflow': block.opts.workflow,
            }),
          );

          const inputs = getPublicIOs(dynamicIOs.data.inputs).map(prepareIO);
          const outputs = getPublicIOs(dynamicIOs.data.outputs).map(prepareIO);
          const ios = getPublicIOs(dynamicIOs.data.ios).map(prepareIO);

          return {
            ...block,
            block_type: {
              ...blockType,
              inputs: [...blockType.inputs, ...inputs],
              outputs: [...blockType.outputs, ...outputs],
              ios: [...blockType.ios, ...ios],
            },
          };
        } else {
          return {
            ...block,
            block_type: blockType,
          };
        }
      }),
    );

    const currentBlock = blocks.find(
      (block) => block.name === params.blockName,
    );

    if (!currentBlock) {
      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId),
      );
    }

    pipeline.data.config.blocks = blocks;

    return json({
      block: currentBlock,
      pipeline: pipeline.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}

function getPublicIOs(ios: IIOType[]) {
  return ios.filter((io) => io.public);
}

function prepareIO(io: IIOType) {
  return { ...io, public: false };
}

function prepareIOsUrl(url: string, context: Record<string, string>) {
  return url
    .replace(/{{(.*?)}}/g, (_, key) => context[key])
    .replace('/api', '');
}
