import React from "react";
import { Icon } from "@elpassion/taco";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { routes } from "~/utils/routes.utils";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { loader } from "./loader";

export function PipelineRunLayout() {
  const location = useLocation();
  const { pipeline, runId, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  return (
    <div>
      <AppNavbar
        leftContent={
          <div className="flex gap-2 text-white">
            <Link to={routes.pipelineRuns(organizationId, pipelineId)}>
              <Icon iconName="arrow-left" className="text-2xl" />
            </Link>
            <div>
              <h2 className="text-2xl font-medium">Run history</h2>
              <h1 className="text-sm font-medium">{pipeline.name}</h1>
            </div>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-10">
        <TabGroup activeTab={location.pathname}>
          <FilledTabsWrapper>
            <FilledTabLink
              tabId={routes.pipelineRun(organizationId, pipelineId, runId)}
              to={routes.pipelineRun(organizationId, pipelineId, runId)}
            >
              Overview
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.pipelineRunCosts(organizationId, pipelineId, runId)}
              to={routes.pipelineRunCosts(organizationId, pipelineId, runId)}
            >
              Costs details
            </FilledTabLink>
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </div>
    </div>
  );
}
