import { json, LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { BlockTypesResponse, PipelineResponse } from "../list/contracts";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const blockTypes = await fetch(BlockTypesResponse, `/block_types`);

    const pipeline = await fetch(
      PipelineResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    );

    return json({
      pipeline: pipeline.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      blockTypes: blockTypes.data.data,
    });
  })(args);
}
