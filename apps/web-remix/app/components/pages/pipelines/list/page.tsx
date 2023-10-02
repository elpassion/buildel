import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { Button } from "@elpassion/taco";
import { loader } from "./loader";
import { PipelinesNavbar } from "./PipelinesNavbar";
import { PipelinesList } from "./PipelinesList";
import { CreatePipelineModal } from "./CreatePipelineModal";
import { generateTemplates, sampleTemplates } from "./workflowTemplates.utils";
import {
  WorkflowTemplates,
  WorkflowTemplatesHeader,
  WorkflowTemplatesList,
} from "./WorkflowTemplates";
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

      <div className="px-4 mx-auto w-full grid grid-cols-1 gap-8 max-w-[100rem] md:px-6 lg:grid-cols-[1fr_400px] lg:px-10">
        {pipelines.data.length > 0 ? (
          <>
            <div className="flex-grow order-2 lg:order-1">
              <Link
                to={routes.pipelinesNew(organizationId)}
                className="mb-6 block w-fit ml-auto mr-0"
              >
                <Button size="sm">New Workflow</Button>
              </Link>

              <PipelinesList pipelines={pipelines.data} />
            </div>
            <TemplatesWithPipelines organizationId={organizationId} />
          </>
        ) : null}

        {pipelines.data.length === 0 ? (
          <TemplatesWithoutPipelines organizationId={organizationId} />
        ) : null}
      </div>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Workflows",
    },
  ];
};

function TemplatesWithPipelines({
  organizationId,
}: {
  organizationId: string;
}) {
  const templates = useMemo(() => generateTemplates(sampleTemplates), []);
  return (
    <WorkflowTemplates className="order-1 lg:order-2 h-fit">
      <WorkflowTemplatesHeader
        heading="Explore our workflow templates"
        subheading="Pick a starting point for your next AI workflow."
      />

      <WorkflowTemplatesList
        items={templates}
        organizationId={organizationId}
      />
    </WorkflowTemplates>
  );
}

function TemplatesWithoutPipelines({
  organizationId,
}: {
  organizationId: string;
}) {
  const templates = useMemo(() => generateTemplates(sampleTemplates), []);
  return (
    <WorkflowTemplates className="max-w-[38rem] mx-auto w-full md:p-8 col-span-2">
      <Link to={routes.pipelinesNew(organizationId)}>
        <Button size="sm" className="mx-auto mb-[30px]">
          Build a new AI workflow
        </Button>
      </Link>
      <WorkflowTemplatesHeader
        heading="Or build upon one of our workflow templates"
        subheading="Pick a starting point for your next AI workflow."
        className="text-center gap-2 md:mb-8"
      />

      <WorkflowTemplatesList
        items={templates}
        organizationId={organizationId}
      />
    </WorkflowTemplates>
  );
}
