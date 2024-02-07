import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { BlockTypesResponse } from "~/components/pages/pipelines/contracts";
import { PipelineApi } from "~/api/pipeline/PipelineApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const blockTypesPromise = fetch(BlockTypesResponse, `/block_types`);

    const pipelineApi = new PipelineApi(fetch);

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
