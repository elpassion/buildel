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
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import {
  ActionSidebar,
  ActionSidebarHeader,
} from '~/components/sidebar/ActionSidebar';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { KnowledgeBaseCollectionList } from './KnowledgeBaseCollectionList';
import type { loader } from './loader.server';

export function KnowledgeBasePage() {
  const { organizationId, collections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const matchNew = useMatch(routes.knowledgeBaseNew(organizationId));
  const isNewSidebarOpen = !!matchNew;

  const matchEdit = useMatch(
    '/:organizationId/knowledge-base/:collectionName/edit',
  );
  const isEditSidebarOpen = !!matchEdit;

  const handleCloseSidebar = () => {
    navigate(routes.knowledgeBase(organizationId));
  };

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Knowledge base</AppNavbarHeading>}
      />

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isNewSidebarOpen || isEditSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        {isNewSidebarOpen && (
          <ActionSidebarHeader
            heading="Create a new collection"
            subheading="Any collection can contain many files and be used in your workflows"
            onClose={handleCloseSidebar}
          />
        )}
        <Outlet />
      </ActionSidebar>

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
          <Link
            to={routes.knowledgeBaseNew(organizationId)}
            aria-label="Go to new collection page"
          >
            <Button size="sm" tabIndex={0}>
              New collection
            </Button>
          </Link>
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
