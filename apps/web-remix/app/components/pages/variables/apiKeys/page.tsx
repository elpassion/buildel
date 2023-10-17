import React from "react";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { loader } from "./loader";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { Button } from "@elpassion/taco";
import { ApiKeyList } from "./ApiKeyList";

export function ApiKeysPage() {
  const navigate = useNavigate();
  const { organizationId, keys } = useLoaderData<typeof loader>();
  const match = useMatch(routes.apiKeysNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.apiKeys(organizationId));
  };

  return (
    <>
      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="New API Key"
          subheading="Enter your API Keys to use them in multiple workflows."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>

      <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
        <Link to={routes.apiKeysNew(organizationId)}>
          <Button size="sm" tabIndex={0}>
            New API Key
          </Button>
        </Link>
      </div>

      <ApiKeyList items={keys} />
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "API Keys",
    },
  ];
};
