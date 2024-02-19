import React from "react";
import { MetaFunction } from "@remix-run/node";
import { ApiKey } from "./ApiKey";
import { AboutOrganization } from "./AboutOrganization";
import { Outlet, useLoaderData, useMatch, useNavigate } from "@remix-run/react";
import { loader } from "./loader.server";
import { Memberships } from "./Memberships";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";

export function OrganizationSettingsPage() {
  const { apiKey, organization, memberships } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(routes.membershipsNew(organization.data.id));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.organizationSettings(organization.data.id));
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
          heading="Create a new workflow"
          subheading="Any workflow can contain many Blocks and use your Knowledge Base."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>
      <div className="flex flex-col gap-9">
        <AboutOrganization organization={organization.data} />
        <ApiKey apiKey={apiKey} />
        <Memberships memberships={memberships.data} />
      </div>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Organization settings",
    },
  ];
};
