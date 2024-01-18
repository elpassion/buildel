import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function PipelineRunCosts() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Costs details</p>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run costs details`,
    },
  ];
};
