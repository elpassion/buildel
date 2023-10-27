import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { loader } from "./loader";
import flowStyles from "reactflow/dist/style.css";
import editorStyles from "~/components/editor/editor.styles.css";
import { TabGroup } from "~/components/tabs/TabGroup";
import { routes } from "~/utils/routes.utils";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];

export function PipelineLayout() {
  const location = useLocation();
  const { pipeline } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">{pipeline.name}</h1>
        }
      />
      <div className="px-4 md:px-6 lg:px-10">
        <TabGroup activeTab={location.pathname}>
          <FilledTabsWrapper>
            <FilledTabLink
              tabId={routes.pipeline(pipeline.organization_id, pipeline.id)}
              to={routes.pipeline(pipeline.organization_id, pipeline.id)}
            >
              Build
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.pipelineRuns(pipeline.organization_id, pipeline.id)}
              to={routes.pipelineRuns(pipeline.organization_id, pipeline.id)}
            >
              Overview
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.pipelineInterface(
                pipeline.organization_id,
                pipeline.id
              )}
              to={routes.pipelineInterface(
                pipeline.organization_id,
                pipeline.id
              )}
            >
              Interface
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.pipelineSettings(
                pipeline.organization_id,
                pipeline.id
              )}
              to={routes.pipelineSettings(
                pipeline.organization_id,
                pipeline.id
              )}
            >
              Settings
            </FilledTabLink>
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </div>
    </>
  );
}
