import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import debounce from 'lodash.debounce';

import { SearchInput } from '~/components/form/inputs/search.input.tsx';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
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
  const { organizationId, collections, search } =
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

        <KnowledgeBaseCollectionList
          organizationId={organizationId}
          items={collections}
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
  const [_, setSearchParams] = useSearchParams();
  const organizationId = useOrganizationId();

  const onSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      prev.set('search', e.target.value);

      return prev;
    });
  }, 500);

  const onSearchClear = () => {
    setSearchParams((prev) => {
      prev.set('search', '');

      return prev;
    });
  };

  return (
    <div
      className={cn('w-full flex gap-2 items-center justify-end', className)}
      {...rest}
    >
      <SearchInput
        placeholder="Search Collections"
        onClear={onSearchClear}
        onChange={onSearchChange}
        autoFocus={!!defaultValues?.search}
        defaultValue={defaultValues?.search}
        key={defaultValues?.search}
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
