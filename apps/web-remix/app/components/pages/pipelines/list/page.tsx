import React, { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import debounce from 'lodash.debounce';
import { BookmarkCheck, Search, X } from 'lucide-react';

import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { confirm } from '~/components/modal/confirm';
import { PipelinesList } from '~/components/pages/pipelines/list/PipelinesList';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
import { Button } from '~/components/ui/button';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
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

  const pipelinesContent = useMemo(() => {
    if (pagination.search || pagination.totalItems > 0) {
      return (
        <ContentWithFilters
          search={pagination.search}
          key={routes.pipelines(organizationId, {
            search: pagination.search,
          })}
        />
      );
    }

    return <TemplatesWithoutPipelines organizationId={organizationId} />;
  }, [organizationId, pagination.search, pagination.totalItems]);

  return (
    <>
      <PipelinesNavbar />

      <Outlet />

      <PageContentWrapper className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-1">
        {pipelinesContent}
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

interface ContentWithFiltersProps {
  search: string;
}

function ContentWithFilters({ search }: ContentWithFiltersProps) {
  const organizationId = useOrganizationId();
  return (
    <>
      <PipelinesFilter search={search} className="-mt-1 mb-10" />
      <ContentWithPipelines
        key={routes.pipelines(organizationId, {
          search,
        })}
      />
    </>
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
        {favorites.length > 0 ? (
          <div>
            <h2 className="text-foreground mb-3 text-base flex gap-1 items-center capitalize">
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

type PipelinesFilterProps = React.HTMLAttributes<HTMLDivElement> & {
  search: string;
};

function PipelinesFilter({
  search,
  className,
  children,
  ...rest
}: PipelinesFilterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const organizationId = useOrganizationId();

  const onChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(
      routes.pipelines(organizationId, {
        search: e.target.value,
      }),
    );
  }, 500);

  const onClear = () => {
    navigate(routes.pipelines(organizationId));
  };

  const onIconClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn('w-full flex gap-2 items-center justify-end', className)}
      {...rest}
    >
      <div className="relative w-fit max-w-[350px]">
        <Search
          className="absolute top-1/2 -translate-y-1/2 left-2.5 w-3.5 h-3.5"
          onClick={onIconClick}
        />

        <TextInput
          size="sm"
          ref={inputRef}
          autoFocus
          placeholder="Search Workflows"
          className={cn('px-8 peer')}
          onChange={onChange}
          defaultValue={search}
        />

        <IconButton
          onlyIcon
          size="xs"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-2.5 w-3.5 h-3.5 text-muted-foreground opacity-0 peer-hover:opacity-100 cursor-pointer hover:opacity-100',
            { hidden: !search },
          )}
          onClick={onClear}
          icon={<X />}
        />
      </div>

      <Button size="sm" asChild>
        <BasicLink
          to={routes.pipelinesNew(organizationId)}
          aria-label="Create new workflow"
        >
          New Workflow
        </BasicLink>
      </Button>

      {children}
    </div>
  );
}
