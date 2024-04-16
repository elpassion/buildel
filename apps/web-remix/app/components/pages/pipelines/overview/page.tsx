import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { dayjs } from "~/utils/Dayjs";
import { loader } from "./loader.server";
import { MonthPicker } from "~/components/pages/pipelines/overview/MonthPicker";
import { PipelineRunsTable } from "~/components/pages/pipelines/overview/PipelineRunsTable";
import { Pagination } from "~/components/pagination/Pagination";

export function OverviewPage() {
  const {
    pipelineRuns: runs,
    pipelineId,
    organizationId,
    pagination,
    details,
    startDate,
    endDate,
  } = useLoaderData<typeof loader>();

  return (
    <section className="pt-5 pb-1">
      <header className="w-full flex items-center justify-between py-2 mb-6">
        <p className="text-white">
          <span className="text-neutral-100">Summary cost ($):</span>{" "}
          {details.total_cost}
        </p>

        <div className="w-[150px]">
          <MonthPicker />
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[750px] pb-3">
          <PipelineRunsTable data={runs} />

          <div className="flex justify-end mt-4">
            <Pagination
              pagination={pagination}
              loaderUrl={routes.pipelineRuns(organizationId, pipelineId, {
                start_date: dayjs(startDate).startOfMonth.toISOString(),
                end_date: dayjs(endDate).endOfMonth.toISOString(),
              })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Pipeline overview",
    },
  ];
};
