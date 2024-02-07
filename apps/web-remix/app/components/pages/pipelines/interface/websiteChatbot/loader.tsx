import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/PipelineApi";

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
      aliasId
    );

    return json({
      pipeline,
      aliasId,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
      pageUrl: process.env["PAGE_URL"],
    });
  })(args);
}
