import React from "react";
import { V2_MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
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

      <div className="bg-neutral-50 p-4 md:p-8 flex-grow">
        <Link
          to={`/${organizationId}/pipelines/new`}
          className="mb-6 block w-fit"
        >
          <Button>
            <span>New Workflow</span>
          </Button>
        </Link>

        <PipelinesList pipelines={pipelines.data} />
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
