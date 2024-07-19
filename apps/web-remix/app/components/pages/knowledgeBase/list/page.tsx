import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';

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
import { routes } from '~/utils/routes.utils';

import { KnowledgeBaseCollectionList } from './KnowledgeBaseCollectionList';
import type { loader } from './loader.server';

export function KnowledgeBasePage() {
  const { organizationId, collections } = useLoaderData<typeof loader>();
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
      >
        <Button asChild className="w-fit ml-auto mr-0 hidden lg:flex">
          <BasicLink to={routes.knowledgeBaseNew(organizationId)}>
            New collection
          </BasicLink>
        </Button>
      </AppNavbar>

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

      <PageContentWrapper>
        <div className="mb-3 flex justify-end lg:hidden">
          <Button size="sm" asChild>
            <BasicLink to={routes.knowledgeBaseNew(organizationId)}>
              New collection
            </BasicLink>
          </Button>
        </div>

        <KnowledgeBaseCollectionList
          organizationId={organizationId}
          items={collections}
        />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Knowledge base',
    },
  ];
};
