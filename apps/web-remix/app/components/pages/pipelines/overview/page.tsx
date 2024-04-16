import { useEffect } from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
import { useInfiniteFetch } from "~/components/pagination/useInfiniteFetch";
import { IPipelineRun } from "~/components/pages/pipelines/pipeline.types";
import { LoadMoreButton } from "~/components/pagination/LoadMoreButton";
import { routes } from "~/utils/routes.utils";
import { dayjs } from "~/utils/Dayjs";
import { loader } from "./loader.server";
import { MonthPicker } from "~/components/pages/pipelines/overview/MonthPicker";

export function OverviewPage() {
  const { ref: fetchNextRef, inView } = useInView();
  const {
    pipelineRuns: initialRuns,
    pipelineId,
    organizationId,
    pagination,
    details,
    startDate,
    endDate,
  } = useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IPipelineRun, typeof loader>({
      pagination,
      initialData: initialRuns,
      dataExtractor: (response) => response.data?.pipelineRuns,
      loaderUrl: routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(startDate).startOfMonth.toISOString(),
        end_date: dayjs(endDate).endOfMonth.toISOString(),
      }),
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <section className="pt-5 pb-1">
      <header className="w-full flex items-center justify-between py-2 border-b border-b-neutral-500 mb-6">
        <p className="text-white">
          <span className="text-neutral-100">Summary cost:</span>{" "}
          {details.total_cost}$
        </p>

        <div className="w-[150px]">
          <MonthPicker />
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[550px]">
          <PipelineRunsListHeader />

          <PipelineRunsList
            items={data}
            pipelineId={pipelineId}
            organizationId={organizationId}
          />

          <div className="flex justify-center mt-4" ref={fetchNextRef}>
            <LoadMoreButton
              isFetching={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onClick={fetchNextPage}
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
