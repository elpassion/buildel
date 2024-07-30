import type { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import type { PipelineApi } from '~/api/pipeline/PipelineApi';
import type {
  IBlockTypes,
  IExtendedPipeline,
  IIOType,
} from '~/components/pages/pipelines/pipeline.types';

export class EnrichedPipelineApi {
  constructor(
    private readonly pipelineApi: PipelineApi,
    private readonly blockTypeApi: BlockTypeApi,
  ) {}

  async getEnrichedPipeline(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
  ): Promise<{ pipeline: IExtendedPipeline; blockTypes: IBlockTypes }> {
    const blockTypesPromise = this.blockTypeApi.getBlockTypes();
    const pipelinePromise = this.pipelineApi.getAliasedPipeline(
      organizationId,
      pipelineId,
      aliasId,
    );

    const [pipeline, blockTypes] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
    ]);

    const blocks = await Promise.all(
      pipeline.config.blocks.map(async (block) => {
        const blockType = blockTypes.data.find(
          (blockType) => blockType.type === block.type,
        );
        if (!blockType) return block;

        if (blockType.dynamic_ios) {
          const url = prepareIOsUrl(blockType.dynamic_ios, {
            organization_id: organizationId as string,
            ...mapOpts(block.opts),
          });

          if (!url) {
            return {
              ...block,
              block_type: blockType,
            };
          }

          const { data: dynamicIOs } =
            await this.blockTypeApi.getBlockDynamicIOs(url);

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

    return {
      pipeline: { ...pipeline, config: { ...pipeline.config, blocks } },
      blockTypes: blockTypes.data,
    };
  }
}

function getPublicIOs(ios: IIOType[]) {
  return ios.filter((io) => io.public);
}

function prepareIO(io: IIOType) {
  return { ...io, public: false };
}

function prepareIOsUrl(url: string, context: Record<string, string>) {
  let allReplaced = true;

  const readyUrl = url.replace('/api', '').replace(/{{(.*?)}}/g, (_, key) => {
    const replaced = context[key];

    if (replaced === undefined) {
      allReplaced = false;
    }

    return replaced;
  });

  return allReplaced ? readyUrl : null;
}

function mapOpts(opts: Record<string, any>) {
  return Object.entries(opts).reduce(
    (acc, [key, value]) => {
      return { ...acc, [`opts.${key}`]: value };
    },
    {} as Record<string, any>,
  );
}
