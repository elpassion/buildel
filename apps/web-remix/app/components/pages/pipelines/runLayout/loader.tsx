import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    const pipelineApi = new PipelineApi(fetch);

    const pipeline = await pipelineApi.getPipeline(
      params.organizationId,
      params.pipelineId
    );

    return json({
      pipeline: pipeline.data,
      runId: params.runId,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
    });
  })(args);
}
