import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);
    const aliasId = pipelineApi.getAliasFromUrl(request.url);

    const pipeline = await pipelineApi.getAliasedPipeline(
      params.organizationId,
      params.pipelineId,
      aliasId,
    );

    return json({
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
      apiUrl: process.env.API_URL!,
      pipeline,
    });
  })(args);
}
