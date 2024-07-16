import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { BlockTypeApi } from "~/api/blockType/BlockTypeApi";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.blockName, "blockName not found");

    const pipelineApi = new PipelineApi(fetch);
    const blockTypeApi = new BlockTypeApi(fetch);

    const pipelinePromise = pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const [pipeline, blockTypes] = await Promise.all([
      pipelinePromise,
      blockTypesPromise,
    ]);

    const blocks = pipeline.data.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    const currentBlock = blocks.find(
      (block) => block.name === params.blockName
    );

    if (!currentBlock) {
      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId)
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
