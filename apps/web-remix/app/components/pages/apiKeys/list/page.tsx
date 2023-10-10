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
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import { ApiKeysList } from "./ApiKeysList";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

export function ApiKeysPage() {
  const navigate = useNavigate();
  const { organizationId, apiKeys } = useLoaderData<typeof loader>();
  const match = useMatch(routes.apiKeysNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.apiKeys(organizationId));
  };

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>API keys</AppNavbarHeading>} />

      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="New API Key"
          subheading="Enter your API keys to use them in multiple workflows."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>

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
