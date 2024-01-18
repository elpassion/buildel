import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
export function OverviewPage() {
  const { pipelineRuns, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  return (
    <section className="pt-5 pb-1 overflow-x-auto">
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
