import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
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
  DefaultTemplateItem,
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
      <PipelinesNavbar>
        <Button asChild className="hidden w-fit ml-auto mr-0 lg:flex">
          <BasicLink
            to={routes.pipelinesNew(organizationId)}
            aria-label="Create new workflow"
          >
            New Workflow
          </BasicLink>
        </Button>
      </PipelinesNavbar>

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
      <PageContentWrapper className="grid grid-cols-1 gap-8 lg:grid-cols-1">
        {pipelines.data.length > 0 ? (
          <>
            <div className="flex-grow order-2 lg:order-1">
              <Button
                asChild
                size="sm"
                className="mb-3 w-fit ml-auto mr-0 flex lg:hidden"
              >
                <BasicLink
                  to={routes.pipelinesNew(organizationId)}
                  aria-label="Create new workflow"
                >
                  New Workflow
                </BasicLink>
              </Button>

              <PipelinesList pipelines={pipelines.data} />
            </div>
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

function TemplatesWithoutPipelines({
  organizationId,
}: PipelinesTemplatesProps) {
  const { templates } = useLoaderData<typeof loader>();

  return (
    <WorkflowTemplates className="max-w-[862px] mx-auto w-full md:p-8 md:absolute md:top-1/3 md:left-1/2 md:-translate-y-1/2 md:-translate-x-1/2">
      <WorkflowTemplatesHeader
        heading={
          <span>
            Create your very{' '}
            <span className="text-blue-500">first workflow</span>
          </span>
        }
        subheading={
          <span>
            We prepared templates to help you get started with Buildel. If you
            need some help with your first steps, read one of our{' '}
            <BasicLink
              className="text-foreground hover:underline"
              target="_blank"
              to="https://docs.buildel.ai/docs/category/guides"
            >
              guides.
            </BasicLink>
          </span>
        }
        className="text-center gap-2 md:mb-8"
      />

      <div>
        <h3 className="text-muted-foreground mb-3">Choose from templates</h3>
        <WorkflowTemplatesList
          items={templates}
          organizationId={organizationId}
        />

        <div className="relative w-full h-[0.5px] bg-neutral-200 my-8">
          <span className="block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-14 text-center text-muted-foreground">
            or
          </span>
        </div>

        <BasicLink
          to={routes.pipelinesNew(organizationId)}
          aria-label="Create new workflow"
        >
          <DefaultTemplateItem />
        </BasicLink>
      </div>
    </WorkflowTemplates>
  );
}
