import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineRunResponse } from "~/components/pages/pipelines/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    const pipelineRun = await fetch(
      PipelineRunResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/runs/${params.runId}`
    );

    return json({
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pipelineRun: pipelineRun.data,
    });
  })(args);
}
