import invariant from "tiny-invariant";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { PipelineResponse } from "~/components/pages/pipelines/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.blockName, "blockName not found");

    const pipeline = await fetch(
      PipelineResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    );

    const currentBlock = pipeline.data.config.blocks.find(
      (block) => block.name === params.blockName
    );

    if (!currentBlock) {
      throw new Response(null, {
        status: 404,
        statusText: "Block not exists",
      });
    }

    return json({
      block: currentBlock,
      pipeline: pipeline.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
