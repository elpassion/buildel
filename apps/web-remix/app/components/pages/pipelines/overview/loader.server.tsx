import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { getParamsPagination } from "~/components/pagination/usePagination";
import { PipelineApi } from "~/api/pipeline/PipelineApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);

    const { page, per_page, search } = getParamsPagination(
      new URL(request.url).searchParams
    );

    const { data: pipelineRuns } = await pipelineApi.getPipelineRuns(
      params.organizationId,
      params.pipelineId,
      { page, per_page, search }
    );

    const totalItems = pipelineRuns.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      pipelineRuns: pipelineRuns.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pagination: { page, per_page, search, totalItems, totalPages },
    });
  })(args);
}
