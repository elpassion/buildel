import React from "react";
import { useLoaderData } from "@remix-run/react";
import {
  PipelineRunCostsList,
  PipelineRunCostsListHeader,
} from "./RunsCostsList";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

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
