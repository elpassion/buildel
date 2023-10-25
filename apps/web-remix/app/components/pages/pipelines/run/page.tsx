import React from "react";
import flowStyles from "reactflow/dist/style.css";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Icon } from "@elpassion/taco";
import { Link, useLoaderData } from "@remix-run/react";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { routes } from "~/utils/routes.utils";
import editorStyles from "~/components/editor/editor.styles.css";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { ReadOnlyNode } from "./ReadOnlyNode";
import { loader } from "./loader";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];
export function PipelineRun() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  return (
    <div>
      <AppNavbar
        leftContent={
          <div className="flex gap-2 text-white">
            <Link
              to={routes.pipelineRuns(pipeline.organization_id, pipeline.id)}
            >
              <Icon iconName="arrow-left" className="text-2xl" />
            </Link>
            <div>
              <h2 className="text-2xl font-medium">Run history</h2>
              <h1 className="text-sm font-medium">{pipeline.name}</h1>
            </div>
          </div>
        }
      />
      <div className="px-4 md:px-6 lg:px-10">
        <Builder
          type="readOnly"
          pipeline={{ ...pipeline, config: pipelineRun.config }}
          CustomNode={ReadOnlyNode}
          CustomEdge={CustomEdge}
        />
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run history`,
    },
  ];
};
