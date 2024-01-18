import React from "react";
import flowStyles from "reactflow/dist/style.css";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import editorStyles from "~/components/editor/editor.styles.css";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { ReadOnlyNode } from "./ReadOnlyNode";
import { loader } from "./loader";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];
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
