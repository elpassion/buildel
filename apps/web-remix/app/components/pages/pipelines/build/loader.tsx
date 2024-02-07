import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { BlockTypesResponse } from "~/components/pages/pipelines/contracts";
import { getAliasedPipeline } from "~/components/pages/pipelines/alias.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const blockTypes = await fetch(BlockTypesResponse, `/block_types`);

    const { pipeline, aliasId } = await getAliasedPipeline({
      fetch,
      params,
      url: request.url,
    });

    const blocks = pipeline.config.blocks.map((block) => ({
      ...block,
      block_type: blockTypes.data.data.find(
        (blockType) => blockType.type === block.type
      ),
    }));

    return json({
      pipeline: { ...pipeline, config: { ...pipeline.config, blocks } },
      aliasId: aliasId,
      blockTypes: blockTypes.data.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
