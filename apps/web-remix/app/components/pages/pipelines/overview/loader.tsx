import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineRunsResponse } from "~/components/pages/pipelines/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineRuns = await fetch(
      PipelineRunsResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/runs`
    );

    return json({ pipelineRuns: pipelineRuns.data });
  })(args);
}
