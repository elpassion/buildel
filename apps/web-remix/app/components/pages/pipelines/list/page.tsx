import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import { BookmarkCheck } from 'lucide-react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { confirm } from '~/components/modal/confirm';
import { PipelinesList } from '~/components/pages/pipelines/list/PipelinesList';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
import { Button } from '~/components/ui/button';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';
import { PipelinesNavbar } from './PipelinesNavbar';
import {
  DefaultTemplateItem,
  WorkflowTemplates,
  WorkflowTemplatesHeader,
  WorkflowTemplatesList,
} from './WorkflowTemplates';

export function PipelinesPage() {
  const { pagination, organizationId } = useLoaderData<typeof loader>();

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

      <Outlet />

      <PageContentWrapper className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-1">
        {pagination.totalItems > 0 ? (
          <ContentWithPipelines key={routes.pipelines(organizationId)} />
        ) : null}

        {pagination.totalItems === 0 ? (
          <TemplatesWithoutPipelines organizationId={organizationId} />
        ) : null}
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Workflows',
    },
  ];
});

interface PipelinesTemplatesProps {
  organizationId: string;
}

function TemplatesWithoutPipelines({
  organizationId,
}: PipelinesTemplatesProps) {
  const { templates } = useLoaderData<typeof loader>();

  return (
    <WorkflowTemplates className="max-w-[862px] mx-auto w-full">
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
        className="text-center gap-2 md:mb-4"
      />

      <div>
        <h3 className="text-muted-foreground mb-3 text-sm">
          Choose from templates
        </h3>
        <WorkflowTemplatesList items={templates} />

        <div className="relative w-full h-[0.5px] bg-neutral-200 my-8">
          <span className="block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-14 text-center text-muted-foreground">
            or
          </span>
        </div>

        <BasicLink
          to={routes.pipelinesNew(organizationId) + '?step=form'}
          aria-label="Create new workflow"
        >
          <DefaultTemplateItem />
        </BasicLink>
      </div>
    </WorkflowTemplates>
  );
}

function ContentWithPipelines() {
  const { ref: fetchNextRef, inView } = useInView();
  const { pipelines, pagination, favorites } = useLoaderData<typeof loader>();

  const organizationId = useOrganizationId();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage, updateData } =
    useInfiniteFetch<IPipeline, typeof loader>({
      pagination,
      initialData: pipelines,
      loaderUrl: routes.pipelines(organizationId),
      dataExtractor: (response) => response.data?.pipelines,
    });

  const onDelete = (pipelineId: string) => {
    updateData((currentData) =>
      currentData.filter((item) => {
        return item.id.toString() !== pipelineId;
      }),
    );
  };

  const { action: deleteWorkflow } = useDeleteWorkflow({ onDelete });

  const onToggle = (pipeline: IPipeline) => {
    updateData((currentData) =>
      currentData.map((item) => {
        if (item.id === pipeline.id) {
          return pipeline;
        }

        return item;
      }),
    );
  };

  const { action: toggleWorkflow } = useToggleWorkflow({ onToggle });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage]);

  return (
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

        {favorites.length > 0 ? (
          <div className="-mt-11 lg:mt-auto">
            <h2 className="text-white mb-3 text-base flex gap-1 items-center capitalize">
              <BookmarkCheck className="w-5 h-5" />{' '}
              <span>Pinned workflows</span>
            </h2>

            <PipelinesList
              pipelines={favorites}
              onDelete={deleteWorkflow}
              onToggleFavorite={toggleWorkflow}
              aria-label="Favorite workflows"
            />

            <h2 className="text-foreground mt-14 mb-3 text-base flex gap-1 items-center capitalize">
              Your workflows
            </h2>
          </div>
        ) : null}

        <PipelinesList
          pipelines={data}
          onDelete={deleteWorkflow}
          onToggleFavorite={toggleWorkflow}
        />

        <div className="flex justify-center mt-5" ref={fetchNextRef}>
          <LoadMoreButton
            isFetching={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onClick={fetchNextPage}
            className="text-xs"
          />
        </div>
      </div>
    </>
  );
}

function useDeleteWorkflow({
  onDelete,
}: {
  onDelete: (pipelineId: string) => void;
}) {
  const deleteFetcher = useFetcher<{ pipelineId: string }>();

  const action = async (
    pipeline: IPipeline,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    confirm({
      onConfirm: async () =>
        deleteFetcher.submit({ pipelineId: pipeline.id }, { method: 'delete' }),
      confirmText: 'Delete workflow',
      children: (
        <p className="text-sm">
          You are about to delete the "{pipeline.name}” workflow from your
          organisation. This action is irreversible.
        </p>
      ),
    });
  };

  useEffect(() => {
    if (deleteFetcher.data && deleteFetcher.state === 'idle') {
      onDelete(deleteFetcher.data.pipelineId);
    }
  }, [deleteFetcher]);

  return { action };
}

function useToggleWorkflow({
  onToggle,
}: {
  onToggle: (pipeline: IPipeline) => void;
}) {
  const toggleFavoriteFetcher = useFetcher<IPipeline>();

  const action = async (
    pipeline: IPipeline,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    const formData = new FormData();

    onToggle({ ...pipeline, favorite: !pipeline.favorite });

    formData.set('pipelineId', pipeline.id.toString());
    formData.set('intent', 'TOGGLE_FAVORITE');

    toggleFavoriteFetcher.submit(formData, { method: 'post' });
  };

  useEffect(() => {
    if (toggleFavoriteFetcher.data && toggleFavoriteFetcher.state === 'idle') {
      onToggle(toggleFavoriteFetcher.data);
    }
  }, [toggleFavoriteFetcher]);

  return { action };
}
