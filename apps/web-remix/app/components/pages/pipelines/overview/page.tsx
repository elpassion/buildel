import { useEffect } from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
import { useInfiniteFetch } from "~/components/pagination/useInfiniteFetch";
import { IPipelineRun } from "~/components/pages/pipelines/pipeline.types";
import { LoadMoreButton } from "~/components/pagination/LoadMoreButton";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader";

export function OverviewPage() {
  const { ref: fetchNextRef, inView } = useInView();
  const {
    pipelineRuns: initialRuns,
    pipelineId,
    organizationId,
    pagination,
    totalCost,
    totalRuns,
  } = useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IPipelineRun, typeof loader>({
      pagination,
      initialData: initialRuns,
      loaderUrl: routes.pipelineRuns(organizationId, pipelineId),
      dataExtractor: (response) => response.data?.pipelineRuns,
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <section className="pt-5 pb-1 overflow-x-auto">
      <div className="flex gap-3 py-4 px-2 mt-3 mb-6 border-b-1 border-neutral-800">
        <p className="text-white">
          <span className="text-sm text-neutral-100">Runs: </span>
          {totalRuns}
        </p>
        <p className="text-white">
          <span className="text-sm text-neutral-100">Summary cost: </span>
          {totalCost.toFixed(10)}$
        </p>
      </div>

      <div className="min-w-[550px]">
        {data.length > 0 ? <PipelineRunsListHeader /> : null}

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
