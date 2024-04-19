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
import { loader } from "./loader.server";
import { Button } from "@elpassion/taco";
import { ActionSidebar } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { Modal } from "@elpassion/taco/Modal";
import classNames from "classnames";

export function KnowledgeBaseCollectionPage() {
  const { fileList, organizationId, collectionName } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const matchNew = useMatch(
    routes.collectionFilesNew(organizationId, collectionName)
  );
  const matchSearch = useMatch(
    routes.knowledgeBaseSearch(organizationId, collectionName)
  );

  const isSidebarOpen = !!matchNew || !!matchSearch;

  const matchDetails = useMatch(
    `:organizationId/knowledge-base/:collectionName/:memoryId/chunks`
  );

  const isDetails = !!matchDetails;

  const handleClose = () => {
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
          <Link to={routes.knowledgeBaseSearch(organizationId, collectionName)}>
            <Button size="sm" tabIndex={0}>
              Test collection
            </Button>
          </Link>

          <Link to={routes.collectionFilesNew(organizationId, collectionName)}>
            <Button size="sm" tabIndex={0}>
              New knowledge item
            </Button>
          </Link>
        </div>
        <KnowledgeBaseFileList items={fileList} />
      </PageContentWrapper>

      <Modal
        isOpen={isDetails}
        header={
          <h3 className="text-white font-medium text-xl">Memory Chunks</h3>
        }
        closeButtonProps={{ iconName: "x", "aria-label": "Close" }}
        onClose={handleClose}
        className="w-full max-w-3xl"
      >
        <div className="max-h-[70vh] p-2">
          <Outlet />
        </div>
      </Modal>

      <ActionSidebar
        className={classNames("!bg-neutral-950", {
          "md:w-[550px]": matchSearch,
        })}
        isOpen={isSidebarOpen}
        onClose={handleClose}
        overlay
      >
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
