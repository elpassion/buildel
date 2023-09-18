import React from "react";
import { V2_MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { loader } from "./loader";
import { PipelinesNavbar } from "./PipelinesNavbar";
import { PipelinesList } from "./PipelinesList";
import { CreatePipelineModal } from "./CreatePipelineModal";
import { Button } from "@elpassion/taco";

export function PipelinesPage() {
  const { pipelines, organizationId } = useLoaderData<typeof loader>();
  const match = useMatch(`${organizationId}/pipelines/new`);
  const isModalOpened = !!match;

  return (
    <>
      <PipelinesNavbar />

      <CreatePipelineModal
        isOpen={isModalOpened}
        organizationId={organizationId}
      >
        <Outlet />
      </CreatePipelineModal>

      <div className="px-4 md:px-10 flex items-start justify-center gap-8">
        {pipelines.data.length > 0 ? (
          <div className="max-w-[80rem] flex-grow">
            <Link
              to={`/${organizationId}/pipelines/new`}
              className="mb-6 block w-fit ml-auto mr-0"
            >
              <Button size="sm">New Workflow</Button>
            </Link>

            <PipelinesList pipelines={pipelines.data} />
          </div>
        ) : null}

        <div className="flex-grow max-w-[25rem] bg-neutral-800 p-2 text-white h-[500px] rounded-lg">
          Tempaltes here...
        </div>
      </div>
    </>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipelines",
    },
  ];
};
