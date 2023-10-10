import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import { ApiKeysList } from "./ApiKeysList";
import { CreateApiKeyModal } from "./CreateApiKeyModal";
import { routes } from "~/utils/routes.utils";

export function ApiKeysPage() {
  const { organizationId, apiKeys } = useLoaderData<typeof loader>();
  const match = useMatch(routes.knowledgeBaseNew(organizationId));
  const isModalOpened = !!match;

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>API keys</AppNavbarHeading>} />

      <CreateApiKeyModal isOpen={isModalOpened} organizationId={organizationId}>
        <Outlet />
      </CreateApiKeyModal>

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
          <Link to={routes.apiKeysNew(organizationId)}>
            <Button size="sm" tabIndex={0}>
              New API key
            </Button>
          </Link>
        </div>

        <ApiKeysList organizationId={organizationId} items={apiKeys} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "API keys",
    },
  ];
};
