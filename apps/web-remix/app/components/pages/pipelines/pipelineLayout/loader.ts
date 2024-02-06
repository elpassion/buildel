import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { AliasesResponse } from "../contracts";
import { getAliasedPipeline } from "~/components/pages/pipelines/alias.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const aliasesPromise = fetch(
      AliasesResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases`
    );

    const pipelinePromise = getAliasedPipeline({
      fetch,
      params,
      url: request.url,
    });

    const [pipelineData, aliases] = await Promise.all([
      pipelinePromise,
      aliasesPromise,
    ]);

    return json({
      pipeline: pipelineData.pipeline,
      aliasId: pipelineData.aliasId,
      aliases: aliases.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
    });
  })(args);
}
