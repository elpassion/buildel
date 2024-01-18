import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import {
  BlockTypesResponse,
  PipelineResponse,
  PipelineRunResponse,
} from "~/components/pages/pipelines/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    const blockTypesPromise = fetch(BlockTypesResponse, `/block_types`);

    const pipelinePromise = fetch(
      PipelineResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    );

    const pipelineRunPromise = fetch(
      PipelineRunResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/runs/${params.runId}`
    );

    const [blockTypes, pipeline, pipelineRun] = await Promise.all([
      blockTypesPromise,
      pipelinePromise,
      pipelineRunPromise,
    ]);

    return json({
      pipeline: pipeline.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      blockTypes: blockTypes.data.data,
      pipelineRun: pipelineRun.data,
    });
  })(args);
}
