import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { AliasesResponse, PipelineResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelinePromise = fetch(
      PipelineResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    );

    const aliasesPromise = fetch(
      AliasesResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases`
    );

    const [pipeline, aliases] = await Promise.all([
      pipelinePromise,
      aliasesPromise,
    ]);

    return json({
      pipeline: pipeline.data,
      aliases: aliases.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
    });
  })(args);
}
