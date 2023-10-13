import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { routes } from "~/utils/routes.utils";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

export function VariablesLayout() {
  const { organizationId } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <>
      <AppNavbar
        leftContent={<AppNavbarHeading>Secrets and API Keys</AppNavbarHeading>}
      />

      <PageContentWrapper>
        <TabGroup activeTab={location.pathname}>
          <div className="bg-neutral-800 flex gap-2 rounded-lg w-fit p-1">
            <FilledTabLink
              tabId={routes.secrets(organizationId)}
              to={routes.secrets(organizationId)}
            >
              Secrets
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.apiKeys(organizationId)}
              to={routes.apiKeys(organizationId)}
            >
              API Keys
            </FilledTabLink>
          </div>

          <Outlet />
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}
