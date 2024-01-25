import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
import { useMemo } from "react";
export function OverviewPage() {
  const { pipelineRuns, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  const totalCost = useMemo(() => {
    return pipelineRuns.reduce(
      (acc, run) =>
        acc +
        run.costs.reduce(
          (costAcc, cost) => costAcc + Number(cost.data.amount),
          0
        ),
      0
    );
  }, [pipelineRuns]);

  return (
    <section className="pt-5 pb-1 overflow-x-auto">
      <div className="flex gap-3 py-4 px-2 mt-3 mb-6 border-b-1 border-neutral-800">
        <p className="text-white">
          <span className="text-sm text-neutral-100">Runs: </span>
          {pipelineRuns.length}
        </p>
        <p className="text-white">
          <span className="text-sm text-neutral-100">Summary cost: </span>
          {totalCost.toFixed(10)}$
        </p>
      </div>

      <div className="min-w-[550px]">
        {pipelineRuns.length > 0 ? <PipelineRunsListHeader /> : null}

        <PipelineRunsList
          items={pipelineRuns}
          pipelineId={pipelineId}
          organizationId={organizationId}
        />
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
