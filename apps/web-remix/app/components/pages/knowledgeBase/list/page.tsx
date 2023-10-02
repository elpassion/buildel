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
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { KnowledgeBaseList } from "./KnowledgeBaseList";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";

export function KnowledgeBasePage() {
  const { fileList, organizationId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(`${organizationId}/knowledge-base/new`);
  const isSidebarOpen = !!match;

  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">Knowledge base</h1>
        }
      />

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-between items-center">
          <span>Search</span>
          <Link to={routes.knowledgeBaseNew(organizationId)}>
            <Button size="sm" tabIndex={0}>
              New knowledge item
            </Button>
          </Link>
        </div>
        <KnowledgeBaseList items={fileList} />
      </PageContentWrapper>

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={() => navigate(routes.knowledgeBase(organizationId))}
        overlay
      >
        <ActionSidebarHeader
          heading="New knowledge items"
          subheading="Upload files to add to Project X Database."
          onClose={() => navigate(routes.knowledgeBase(organizationId))}
        />
        <Outlet />
      </ActionSidebar>
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
