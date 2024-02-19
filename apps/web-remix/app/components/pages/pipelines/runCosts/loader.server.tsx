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

    const pipelineRun = await pipelineApi.getPipelineRun(
      params.organizationId,
      params.pipelineId,
      params.runId
    );

    return json({
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pipelineRun: pipelineRun.data,
    });
  })(args);
}
