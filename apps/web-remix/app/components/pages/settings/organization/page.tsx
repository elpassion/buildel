import React from "react";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  OutlinedTabLink,
  OutlinedTabsWrapper,
} from "~/components/tabs/OutlinedTabs";
import { TabGroup } from "~/components/tabs/TabGroup";
import { routes } from "~/utils/routes.utils";
import { AboutOrganization } from "./AboutOrganization";
import { ApiKey } from "./ApiKey";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function OrganizationSettingsPage() {
  const { apiKey, organization } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-9">
      <AboutOrganization organization={organization} />

      <ApiKey apiKey={apiKey} />

      <div className="mt-6">
        <TabGroup>
          <OutlinedTabsWrapper>
            <OutlinedTabLink
              end
              to={routes.organizationSettings(organization.id)}
            >
              Members
            </OutlinedTabLink>
            <OutlinedTabLink
              to={routes.organizationInvitations(organization.id)}
            >
              Invitations
            </OutlinedTabLink>
          </OutlinedTabsWrapper>

          <div className="pt-8">
            <Outlet />
          </div>
        </TabGroup>
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Organization settings",
    },
  ];
};
