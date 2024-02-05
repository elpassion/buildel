import React from "react";
import type { LinksFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import editorStyles from "~/components/editor/editor.styles.css";
import flowStyles from "reactflow/dist/style.css";
import { routes } from "~/utils/routes.utils";
import { TabGroup } from "~/components/tabs/TabGroup";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { AliasSelect, CreateAliasForm } from "./Aliases";
import { loader } from "./loader";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];

export function PipelineLayout() {
  const { pipeline, aliases } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <div className="flex gap-3 items-center justify-between w-full">
            <h1 className="text-2xl font-medium text-white">{pipeline.name}</h1>

            <div className="flex gap-2 items-center">
              <AliasSelect aliases={aliases} />

              <CreateAliasForm pipeline={pipeline} />
            </div>
          </div>
        }
      />
      <div className="px-4 md:px-6 lg:px-10">
        <TabGroup>
          <FilledTabsWrapper>
            <FilledTabLink
              end
              to={routes.pipelineBuild(pipeline.organization_id, pipeline.id)}
            >
              Build
            </FilledTabLink>
            <FilledTabLink
              to={routes.pipelineRuns(pipeline.organization_id, pipeline.id)}
            >
              Overview
            </FilledTabLink>
            <FilledTabLink
              to={routes.pipelineInterface(
                pipeline.organization_id,
                pipeline.id
              )}
            >
              Interface
            </FilledTabLink>
            <FilledTabLink
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
