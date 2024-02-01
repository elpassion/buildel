import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { PipelineRunsResponse } from "~/components/pages/pipelines/contracts";
import { getParamsPagination } from "~/components/pagination/usePagination";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineRuns = await fetch(
      PipelineRunsResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/runs`
    );

    const { page, limit, search } = getParamsPagination(
      new URL(request.url).searchParams
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = pipelineRuns.data.slice(startIndex, endIndex);

    const totalItems = pipelineRuns.data.length;
    const totalPages = Math.ceil(totalItems / limit);

    return json({
      pipelineRuns: paginatedData,
      totalCost: pipelineRuns.data.reduce(
        (acc, run) =>
          acc +
          run.costs.reduce(
            (costAcc, cost) => costAcc + Number(cost.data.amount),
            0
          ),
        0
      ),
      totalRuns: pipelineRuns.data.length,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pagination: { page, limit, search, totalItems, totalPages },
    });
  })(args);
}
