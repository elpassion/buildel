import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import { KnowledgeBaseCollectionList } from "./KnowledgeBaseCollectionList";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { routes } from "~/utils/routes.utils";

export function KnowledgeBasePage() {
  const { organizationId, collections } = useLoaderData<typeof loader>();
  const match = useMatch(routes.knowledgeBaseNew(organizationId));
  const isModalOpened = !!match;

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Knowledge base</AppNavbarHeading>}
      />

      <CreateCollectionModal
        isOpen={isModalOpened}
        organizationId={organizationId}
      >
        <Outlet />
      </CreateCollectionModal>

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
