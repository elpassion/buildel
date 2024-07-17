import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import {
  ActionSidebar,
  ActionSidebarHeader,
} from '~/components/sidebar/ActionSidebar';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';
import { PipelinesList } from './PipelinesList';
import { PipelinesNavbar } from './PipelinesNavbar';
import {
  WorkflowTemplates,
  WorkflowTemplatesHeader,
  WorkflowTemplatesList,
} from './WorkflowTemplates';

export function PipelinesPage() {
  const { pipelines, organizationId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(`${organizationId}/pipelines/new`);
  const isSidebarOpen = !!match;
  const handleCloseSidebar = () => {
    navigate(routes.pipelines(organizationId));
  };

  return (
    <>
      <PipelinesNavbar />

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="Create a new workflow"
          subheading="Any workflow can contain many Blocks and use your Knowledge Base."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>
      <PageContentWrapper className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {pipelines.data.length > 0 ? (
          <>
            <div className="flex-grow order-2 lg:order-1">
              <Link
                to={routes.pipelinesNew(organizationId)}
                className="mb-6 block w-fit ml-auto mr-0"
                aria-label="Create new workflow"
              >
                <Button tabIndex={0} size="sm">
                  New Workflow
                </Button>
              </Link>

              <PipelinesList pipelines={pipelines.data} />
            </div>
            <TemplatesWithPipelines organizationId={organizationId} />
          </>
        ) : null}

        {pipelines.data.length === 0 ? (
          <TemplatesWithoutPipelines organizationId={organizationId} />
        ) : null}
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Workflows',
    },
  ];
};

interface PipelinesTemplatesProps {
  organizationId: string;
}

function TemplatesWithPipelines({ organizationId }: PipelinesTemplatesProps) {
  const { templates } = useLoaderData<typeof loader>();

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
}: PipelinesTemplatesProps) {
  const { templates } = useLoaderData<typeof loader>();

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
