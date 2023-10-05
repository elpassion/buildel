import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import { KnowledgeBaseCollectionList } from "./KnowledgeBaseCollectionList";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { routes } from "~/utils/routes.utils";

export function KnowledgeBasePage() {
  const { organizationId } = useLoaderData<typeof loader>();
  const match = useMatch(routes.knowledgeBaseNew(organizationId));
  const isModalOpened = !!match;

  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">Knowledge base</h1>
        }
      />

      <CreateCollectionModal
        isOpen={isModalOpened}
        organizationId={organizationId}
      >
        <Outlet />
      </CreateCollectionModal>

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-between items-center">
          <span>Search</span>

          <Link to={routes.knowledgeBaseNew(organizationId)}>
            <Button size="sm" tabIndex={0}>
              New collection
            </Button>
          </Link>
        </div>

        <KnowledgeBaseCollectionList
          organizationId={organizationId}
          items={[{ id: "1", name: "72_document_search_1" }]}
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
