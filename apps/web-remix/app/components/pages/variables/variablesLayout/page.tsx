import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { routes } from "~/utils/routes.utils";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";

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
          <FilledTabsWrapper>
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
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}
