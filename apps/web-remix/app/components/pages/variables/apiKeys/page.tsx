import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useMatch, useNavigate } from "@remix-run/react";
import { loader } from "./loader";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

export function ApiKeysPage() {
  const navigate = useNavigate();
  const { organizationId } = useLoaderData<typeof loader>();
  const match = useMatch(routes.secretsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.secrets(organizationId));
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

      <p>API KEYS</p>
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
