import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { getParamsPagination } from "~/components/pagination/usePagination";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { dayjs } from "~/utils/Dayjs";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);
    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);

    const start_date =
      searchParams.get("start_date") ??
      dayjs(new Date()).startOfMonth.toISOString();
    const end_date =
      searchParams.get("end_date") ??
      dayjs(new Date()).endOfMonth.toISOString();

    const { data: pipelineRuns } = await pipelineApi.getPipelineRuns(
      params.organizationId,
      params.pipelineId,
      { page, per_page, search, start_date, end_date }
    );

    const totalItems = pipelineRuns.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      pipelineRuns: pipelineRuns.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pagination,
    });
  })(args);
}
