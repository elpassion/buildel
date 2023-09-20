import React from "react";
import { V2_MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { loader } from "./loader";
import { PipelinesNavbar } from "./PipelinesNavbar";
import { PipelinesList } from "./PipelinesList";
import { CreatePipelineModal } from "./CreatePipelineModal";
import { Button, Icon } from "@elpassion/taco";
import {
  WorkflowTemplates,
  WorkflowTemplatesHeader,
  WorkflowTemplatesList,
} from "~/components/pages/pipelines/list/WorkflowTemplates";
import { routes } from "~/utils/routes.utils";

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
          <>
            <div className="max-w-[80rem] flex-grow">
              <Link
                to={`/${organizationId}/pipelines/new`}
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

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipelines",
    },
  ];
};

const dummyTemplates = (organizationId: string) => [
  {
    id: 1,
    name: "AI Chat",
    icon: <Icon iconName="home" />,
    to: routes.pipelines(organizationId),
  },
  {
    id: 2,
    name: "Speech To Text",
    icon: <Icon iconName="home" />,
    to: routes.pipelines(organizationId),
  },
  {
    id: 3,
    name: "Text To Speech",
    icon: <Icon iconName="home" />,
    to: routes.pipelines(organizationId),
  },
  {
    id: 4,
    name: "Knowledge Search To Text",
    icon: <Icon iconName="search" />,
    to: routes.pipelines(organizationId),
  },
  {
    id: 5,
    name: "Another template",
    icon: <Icon iconName="search" />,
    to: routes.pipelines(organizationId),
  },
];

function TemplatesWithPipelines({
  organizationId,
}: {
  organizationId: string;
}) {
  return (
    <WorkflowTemplates className="max-w-[25rem]">
      <WorkflowTemplatesHeader
        heading="Explore our workflow templates"
        subheading="Pick a starting point for your next AI workflow."
      />

      <WorkflowTemplatesList items={dummyTemplates(organizationId)} />
    </WorkflowTemplates>
  );
}

function TemplatesWithoutPipelines({
  organizationId,
}: {
  organizationId: string;
}) {
  return (
    <WorkflowTemplates className="max-w-[38rem] md:p-8">
      <Button size="sm" className="mx-auto mb-[30px]">
        Build a new AI workflow
      </Button>
      <WorkflowTemplatesHeader
        heading="Or build upon one of our workflow templates"
        subheading="Pick a starting point for your next AI workflow."
        className="text-center gap-2 md:mb-8"
      />

      <WorkflowTemplatesList items={dummyTemplates(organizationId)} />
    </WorkflowTemplates>
  );
}
