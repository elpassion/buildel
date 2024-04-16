import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
import { useInfiniteFetch } from "~/components/pagination/useInfiniteFetch";
import { IPipelineRun } from "~/components/pages/pipelines/pipeline.types";
import { LoadMoreButton } from "~/components/pagination/LoadMoreButton";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader.server";
import { dayjs } from "~/utils/Dayjs";
import { DatepickerInput } from "~/components/form/inputs/datepicker.input";

export function OverviewPage() {
  const { ref: fetchNextRef, inView } = useInView();
  const [date, setDate] = useState(new Date());
  const {
    pipelineRuns: initialRuns,
    pipelineId,
    organizationId,
    pagination,
  } = useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IPipelineRun, typeof loader>({
      pagination,
      initialData: initialRuns,
      dataExtractor: (response) => response.data?.pipelineRuns,
      loaderUrl: routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(date).startOfMonth.toISOString(),
        end_date: dayjs(date).endOfMonth.toISOString(),
      }),
    });
  const handleSetDate = (date: Date | null) => {
    setDate(date ?? new Date());
  };
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <section className="pt-5 pb-1">
      <header className="w-full flex justify-end items-center py-2 border-b border-b-neutral-500 mb-6">
        {/*<p className="text-white">Summary cost: 123</p>*/}

        <div className="w-[150px]">
          <DatepickerInput
            selected={date}
            onChange={handleSetDate}
            showMonthYearPicker
            dateFormat="MMMM"
          />
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
