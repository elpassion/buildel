import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { BlockTypeApi } from "~/api/blockType/BlockTypeApi";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);
    const aliasId = pipelineApi.getAliasFromUrl(request.url);
    const blockTypeApi = new BlockTypeApi(fetch);

    const blockTypesPromise = blockTypeApi.getBlockTypes();

    const aliasesPromise = pipelineApi.getAliases(
      params.organizationId,
      params.pipelineId
    );

    const pipelinePromise = pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId
    );

    const [pipeline, aliases, blockTypes] = await Promise.all([
      pipelinePromise,
      aliasesPromise,
      blockTypesPromise,
    ]);

    const blocks = pipeline.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    return json({
      aliasId,
      pipeline: {
        ...pipeline,
        config: { ...pipeline.config, blocks },
      },
      aliases: aliases.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
    });
  })(args);
}
