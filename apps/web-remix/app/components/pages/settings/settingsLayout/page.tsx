import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader";

export function SettingsLayout() {
  const { organizationId } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading className="flex gap-3 items-center">
            Settings
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper>
        <TabGroup activeTab={location.pathname}>
          <FilledTabsWrapper>
            <FilledTabLink
              tabId={routes.organizationSettings(organizationId)}
              to={routes.organizationSettings(organizationId)}
            >
              Your Organization
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.profileSettings(organizationId)}
              to={routes.profileSettings(organizationId)}
            >
              Your Profile
            </FilledTabLink>
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}
