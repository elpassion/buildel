import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Builder } from "~/components/pages/pipelines/builder/Builder";
import { loader } from "./loader";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { routes } from "~/utils/routes.utils";
import { Icon } from "@elpassion/taco";

export function PipelineRun() {
  const { pipeline, blockTypes, pipelineRun } = useLoaderData<typeof loader>();

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
              <h2 className="text-2xl font-medium">Run {pipelineRun.id}</h2>
              <h1 className="text-sm font-medium">{pipeline.name}</h1>
            </div>
          </div>
        }
      />
      <div className="px-4 md:px-6 lg:px-10">
        <Builder
          pipeline={{ ...pipeline, config: pipelineRun.config }}
          blockTypes={blockTypes}
        />
      </div>
    </div>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Run ${data?.pipelineRun.id}`,
    },
  ];
};
