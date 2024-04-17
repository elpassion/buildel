import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { getParamsPagination } from "~/components/pagination/usePagination";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { dayjs } from "~/utils/Dayjs";
import { DateFilterSchema } from "./schema";

const DEFAULT_START_DATE = dayjs(new Date()).startOfMonth.toISOString();
const DEFAULT_END_DATE = dayjs(new Date()).endOfMonth.toISOString();

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);
    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);
    const start_date = searchParams.get("start_date") ?? DEFAULT_START_DATE;
    const end_date = searchParams.get("end_date") ?? DEFAULT_END_DATE;

    const dateResult = DateFilterSchema.safeParse({ start_date, end_date });

    const dates = dateResult.success
      ? { start_date, end_date }
      : {
          start_date: DEFAULT_START_DATE,
          end_date: DEFAULT_END_DATE,
        };

    const runsPromise = pipelineApi.getPipelineRuns(
      params.organizationId,
      params.pipelineId,
      { page, per_page, search, ...dates }
    );

    const detailsPromise = pipelineApi.getPipelineDetails(
      params.organizationId,
      params.pipelineId,
      dates
    );

    const [{ data: pipelineRuns }, details] = await Promise.all([
      runsPromise,
      detailsPromise,
    ]);

    const totalItems = pipelineRuns.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      details: details.data,
      pipelineRuns: pipelineRuns.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
      pagination,
      startDate: dates.start_date,
      endDate: dates.end_date,
    });
  })(args);
}
