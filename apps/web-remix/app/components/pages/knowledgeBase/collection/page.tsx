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
import { KnowledgeBaseFileList } from "./KnowledgeBaseFileList";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";

export function KnowledgeBaseCollectionPage() {
  const { fileList, organizationId, collectionName } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(
    `${organizationId}/knowledge-base/${encodeURIComponent(collectionName)}/new`
  );
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.collectionFiles(organizationId, collectionName));
  };
  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">
            {collectionName} Database
          </h1>
        }
      />

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
          <Link to={routes.collectionFilesNew(organizationId, collectionName)}>
            <Button size="sm" tabIndex={0}>
              New knowledge item
            </Button>
          </Link>
        </div>
        <KnowledgeBaseFileList items={fileList} />
      </PageContentWrapper>

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="New knowledge items"
          subheading={`Upload files to add to ${collectionName} Database.`}
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} database`,
    },
  ];
};
