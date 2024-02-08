import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { BlockTypeApi } from "~/api/blockType/BlockTypeApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    const blockTypeApi = new BlockTypeApi(fetch);
    const pipelineApi = new PipelineApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    const [pipeline, blockTypes] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
    ]);

    const blocks = pipeline.data.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    return json({
      pipeline: {
        ...pipeline.data,
        config: { ...pipeline.data.config, blocks },
      },
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
    });
  })(args);
}
