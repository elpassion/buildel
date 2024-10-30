import type { BlockTypeApi } from '~/api/blockType/BlockTypeApi';
import type { PipelineApi } from '~/api/pipeline/PipelineApi';
import type {
  IBlockConfig,
  IBlockTypes,
  IExtendedPipeline,
  IIOType,
  IPipelineRun,
} from '~/components/pages/pipelines/pipeline.types';

export class EnrichedPipelineApi {
  constructor(
    private readonly pipelineApi: PipelineApi,
    private readonly blockTypeApi: BlockTypeApi,
  ) {}

  async getEnrichedPipeline(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number = 'latest',
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

    const blocks = await this.enrichConfigWithDynamicIOs(
      pipeline.config.blocks,
      blockTypes.data,
      { organization_id: organizationId, pipeline_id: pipelineId },
    );

    return {
      pipeline: { ...pipeline, config: { ...pipeline.config, blocks } },
      blockTypes: blockTypes.data,
    };
  }

  async getEnrichedPipelineRun(
    organizationId: string | number,
    pipelineId: string | number,
    runId: string | number,
  ): Promise<{ pipelineRun: IPipelineRun; blockTypes: IBlockTypes }> {
    const blockTypesPromise = this.blockTypeApi.getBlockTypes();
    const pipelineRunPromise = this.pipelineApi.getPipelineRun(
      organizationId,
      pipelineId,
      runId,
    );

    const [pipelineRun, blockTypes] = await Promise.all([
      pipelineRunPromise,
      blockTypesPromise,
    ]);

    const blocks = await this.enrichConfigWithDynamicIOs(
      pipelineRun.data.config.blocks,
      blockTypes.data,
      { organization_id: organizationId, pipeline_id: pipelineId },
    );

    return {
      pipelineRun: {
        ...pipelineRun.data,
        config: { ...pipelineRun.data.config, blocks },
      },
      blockTypes: blockTypes.data,
    };
  }

  private async enrichConfigWithDynamicIOs(
    blocks: IBlockConfig[],
    blockTypes: IBlockTypes,
    ctx: Record<string, string | number>,
  ) {
    return Promise.all(
      blocks.map(async (block) =>
        this.enrichBlockWithDynamicIOs(block, blockTypes, ctx),
      ),
    );
  }

  private async enrichBlockWithDynamicIOs(
    block: IBlockConfig,
    blockTypes: IBlockTypes,
    ctx: Record<string, string | number>,
  ) {
    const blockType = blockTypes.find(
      (blockType) => blockType.type === block.type,
    );
    if (!blockType) return block;

    if (blockType.dynamic_ios) {
      const url = this.prepareIOsUrl(blockType.dynamic_ios, {
        block_name: block.name,
        ...ctx,
        ...this.mapOpts(block.opts),
      });

      if (!url) {
        return {
          ...block,
          block_type: blockType,
        };
      }

      try {
        const { data: dynamicIOs } =
          await this.blockTypeApi.getBlockDynamicIOs(url);

        const inputs = this.getPublicIOs(dynamicIOs.data.inputs).map(
          this.prepareIO,
        );
        const outputs = this.getPublicIOs(dynamicIOs.data.outputs).map(
          this.prepareIO,
        );
        const ios = this.getPublicIOs(dynamicIOs.data.ios).map(this.prepareIO);

        return {
          ...block,
          block_type: {
            ...blockType,
            inputs: [...blockType.inputs, ...inputs],
            outputs: [...blockType.outputs, ...outputs],
            ios: [...blockType.ios, ...ios],
          },
        };
      } catch (err) {
        console.error(err);

        return {
          ...block,
          block_type: blockType,
        };
      }
    } else {
      return {
        ...block,
        block_type: blockType,
      };
    }
  }

  private getPublicIOs(ios: IIOType[]) {
    return ios.filter((io) => io.public);
  }

  private prepareIO(io: IIOType) {
    return { ...io, public: false };
  }

  private prepareIOsUrl(url: string, context: Record<string, string>) {
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

  private mapOpts(opts: Record<string, any>) {
    return Object.entries(opts).reduce(
      (acc, [key, value]) => {
        return { ...acc, [`opts.${key}`]: value };
      },
      {} as Record<string, any>,
    );
  }
}
