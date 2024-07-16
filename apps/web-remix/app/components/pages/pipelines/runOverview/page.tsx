import { useLoaderData } from "@remix-run/react";
import { Builder } from "../Builder";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { ReadOnlyNode } from "./ReadOnlyNode";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function PipelineRunOverview() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  return (
    <Builder
      type="readOnly"
      className="h-[calc(100vh_-_145px)]"
      pipeline={{ ...pipeline, config: pipelineRun.config }}
      CustomNode={ReadOnlyNode}
      CustomEdge={CustomEdge}
    />
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run overview`,
    },
  ];
};
