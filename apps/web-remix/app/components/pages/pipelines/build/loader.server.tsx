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
    const aliasId = pipelineApi.getAliasFromUrl(request.url);

    const blockTypes = await blockTypeApi.getBlockTypes();

    const pipeline = await pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId,
    );

    const blocks = pipeline.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type,
      ),
    }));

    return json({
      pipeline: { ...pipeline, config: { ...pipeline.config, blocks } },
      aliasId: aliasId,
      blockTypes: blockTypes.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
