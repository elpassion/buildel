import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { PipelineRunsList, PipelineRunsListHeader } from "./PipelineRunsList";
export function OverviewPage() {
  const { pipelineRuns } = useLoaderData<typeof loader>();

  console.log(pipelineRuns);
  return (
    <section className="pt-5">
      <PipelineRunsListHeader />
      <PipelineRunsList items={pipelineRuns} />
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
