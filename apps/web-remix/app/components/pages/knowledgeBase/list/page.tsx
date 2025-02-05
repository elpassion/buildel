import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import type { IKnowledgeBaseCollection } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
import type { Pagination } from '~/components/pagination/usePagination';
import { PageSearch } from '~/components/search/PageSearch';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { KnowledgeBaseCollectionList } from './KnowledgeBaseCollectionList';
import type { loader } from './loader.server';

export function KnowledgeBasePage() {
  const { organizationId, collections, pagination, search } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const matchNew = useMatch(routes.knowledgeBaseNew(organizationId));
  const isNewSidebarOpen = !!matchNew;
  const handleCloseSidebar = (value: boolean) => {
    if (value) return;
    navigate(routes.knowledgeBase(organizationId));
  };

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Knowledge base</AppNavbarHeading>}
      />

      <DialogDrawer open={isNewSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Create a new collection</DialogDrawerTitle>
            <DialogDrawerDescription>
              Any collection can contain many files and be used in your
              workflows
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>

      <PageContentWrapper className="mt-6">
        <CollectionsFilter defaultValues={{ search }} className="-mt-1 mb-10" />

        <InfiniteLoadedList
          key={search ?? 'all'}
          initialData={collections}
          pagination={pagination}
          organizationId={organizationId}
        />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Knowledge base',
    },
  ];
});

type CollectionsFilterProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValues?: {
    search?: string;
  };
};

function CollectionsFilter({
  defaultValues,
  className,
  children,
  ...rest
}: CollectionsFilterProps) {
  const organizationId = useOrganizationId();

  return (
    <div
      className={cn('w-full flex gap-2 items-center justify-end', className)}
      {...rest}
    >
      <PageSearch
        placeholder="Search Collections"
        defaultValue={defaultValues?.search}
      />

      <Button size="sm" asChild>
        <BasicLink to={routes.knowledgeBaseNew(organizationId)}>
          New collection
        </BasicLink>
      </Button>

      {children}
    </div>
  );
}

function InfiniteLoadedList({
  organizationId,
  initialData,
  pagination,
}: {
  organizationId: string;
  initialData: IKnowledgeBaseCollection[];
  pagination: Pagination;
}) {
  const { ref: fetchNextRef, inView } = useInView();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IKnowledgeBaseCollection, typeof loader>({
      pagination,
      initialData: initialData,
      loaderUrl: routes.knowledgeBase(organizationId),
      dataExtractor: (response) => response.data?.collections,
    });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage]);

  return (
    <>
      <KnowledgeBaseCollectionList
        organizationId={organizationId}
        items={data}
      />

      <div className="flex justify-center mt-5" ref={fetchNextRef}>
        <LoadMoreButton
          isFetching={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onClick={fetchNextPage}
          className="text-xs"
        />
      </div>
    </>
  );
}
