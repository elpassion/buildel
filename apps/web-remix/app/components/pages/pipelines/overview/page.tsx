import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
export function OverviewPage() {
  const { pipelineRuns, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  return (
    <section className="pt-5">
      <PipelineRunsListHeader />
      <PipelineRunsList
        items={pipelineRuns}
        pipelineId={pipelineId}
        organizationId={organizationId}
      />
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
