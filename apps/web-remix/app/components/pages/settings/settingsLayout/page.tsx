import React from "react";
import { Outlet, useLoaderData } from "@remix-run/react";

import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader.server";

export function SettingsLayout() {
  const { organizationId } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading className="flex gap-3 items-center">
            Settings
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper className="!ml-0">
        <TabGroup>
          <FilledTabsWrapper>
            <FilledTabLink to={routes.organizationSettings(organizationId)}>
              Your Organization
            </FilledTabLink>
            <FilledTabLink to={routes.profileSettings(organizationId)}>
              Your Profile
            </FilledTabLink>
          </FilledTabsWrapper>

          <div className="pt-10">
            <Outlet />
          </div>
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}
