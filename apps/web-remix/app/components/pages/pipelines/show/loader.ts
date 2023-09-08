import { json, LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { fetchTyped } from "~/utils.server";
import { BlockTypesResponse, PipelineResponse } from "../list/contracts";

export async function loader({ request, params }: LoaderArgs) {
  requireLogin(request);
  invariant(params.organizationId, "organizationId not found");
  invariant(params.pipelineId, "pipelineId not found");

  const blockTypes = await fetchTyped(
    BlockTypesResponse,
    `http://127.0.0.1:4000/api/block_types`,
    {}
  );

  const pipeline = await fetchTyped(
    PipelineResponse,
    `http://127.0.0.1:4000/api/organizations/${params.organizationId}/pipelines/${params.pipelineId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie")!,
      },
    }
  );

  return json({
    pipeline,
    organizationId: params.organizationId,
    pipelineId: params.pipelineId,
    blockTypes,
  });
}
