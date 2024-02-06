import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { getAliasedPipeline } from "~/components/pages/pipelines/alias.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    // const pipeline = await fetch(
    //   PipelineResponse,
    //   `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    // );

    const { pipeline, aliasId } = await getAliasedPipeline({
      fetch,
      params,
      url: request.url,
    });

    return json({
      pipeline,
      aliasId,
      pipelineId: params.pipelineId,
      organizationId: params.organizationId,
      pageUrl: process.env["PAGE_URL"],
    });
  })(args);
}
