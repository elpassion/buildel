import React from "react";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { loader } from "./loader.server";
import { Button } from "@elpassion/taco";
import { KnowledgeBaseCollectionList } from "./KnowledgeBaseCollectionList";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

export function KnowledgeBasePage() {
  const { organizationId, collections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(routes.knowledgeBaseNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.knowledgeBase(organizationId));
  };

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Knowledge base123</AppNavbarHeading>}
      />

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="Create a new collection"
          subheading="Any collection can contain many files and be used in your workflows"
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
          <Link to={routes.knowledgeBaseNew(organizationId)}>
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
      title: "Knowledge base",
    },
  ];
};
