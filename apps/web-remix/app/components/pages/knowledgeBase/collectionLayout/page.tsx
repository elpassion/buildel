import React from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatch } from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { loader } from "./loader.server";
import { Button } from "@elpassion/taco";
import { routes } from "~/utils/routes.utils";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";

export function KnowledgeBaseCollectionLayout() {
  const { organizationId, collectionName } = useLoaderData<typeof loader>();
  const matchContent = useMatch(
    routes.collectionFiles(organizationId, collectionName)
  );

  const linkToSearch = !matchContent
    ? routes.collectionInterfaceSearch(organizationId, collectionName)
    : routes.collectionSearch(organizationId, collectionName);

  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">
            {collectionName} Database
          </h1>
        }
      />

      <PageContentWrapper>
        <TabGroup>
          <div className="flex gap-2 justify-between items-center mt-5">
            <FilledTabsWrapper>
              <FilledTabLink
                to={routes.collectionFiles(organizationId, collectionName)}
              >
                Content
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionOverview(organizationId, collectionName)}
              >
                Overview
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionInterface(organizationId, collectionName)}
              >
                Interface
              </FilledTabLink>
              <FilledTabLink
                to={routes.collectionSettings(organizationId, collectionName)}
              >
                Settings
              </FilledTabLink>
            </FilledTabsWrapper>

            <Link to={linkToSearch}>
              <Button size="sm" tabIndex={0}>
                Ask a question
              </Button>
            </Link>
          </div>

          <div className="pt-6">
            <Outlet />
          </div>
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} database`,
    },
  ];
};
