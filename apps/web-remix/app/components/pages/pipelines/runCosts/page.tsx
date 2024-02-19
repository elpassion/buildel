import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader.server";
import {
  PipelineRunCostsList,
  PipelineRunCostsListHeader,
} from "./RunsCostsList";

export function PipelineRunCosts() {
  const { pipelineRun } = useLoaderData<typeof loader>();

  return (
    <section className="pt-5 pb-1 overflow-x-auto">
      <div className="min-w-[450px]">
        {pipelineRun.costs.length > 0 ? <PipelineRunCostsListHeader /> : null}

        <PipelineRunCostsList items={pipelineRun.costs} />
      </div>
    </section>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Costs details`,
    },
  ];
};
