import invariant from "tiny-invariant";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { PipelineResponse } from "~/components/pages/pipelines/contracts";
import { routes } from "~/utils/routes.utils";

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
      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId)
      );
    }

    return json({
      block: currentBlock,
      pipeline: pipeline.data,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
