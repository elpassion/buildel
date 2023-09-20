import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Navbar } from "@elpassion/taco";
import { loader } from "./loader";
import flowStyles from "reactflow/dist/style.css";
import editorStyles from "~/components/editor/editor.styles.css";
import { TabGroup } from "~/components/tabs/TabGroup";
import { routes } from "~/utils/routes.utils";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];

export function PipelineLayout() {
  const location = useLocation();
  const { pipeline } = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar
        wrapperClassName="md:px-2 md:pt-2"
        leftContent={
          <h1 className="text-2xl font-medium text-white">{pipeline.name}</h1>
        }
      />
      <div className="md:px-10">
        <TabGroup activeTab={location.pathname}>
          <div className="bg-neutral-800 flex gap-2 rounded-lg w-fit p-1">
            <FilledTabLink
              tabId={routes.pipeline(pipeline.organization_id, pipeline.id)}
              to={routes.pipeline(pipeline.organization_id, pipeline.id)}
            >
              Overview
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.pipelineBuilder(
                pipeline.organization_id,
                pipeline.id
              )}
              to={routes.pipelineBuilder(pipeline.organization_id, pipeline.id)}
            >
              Builder
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
            <FilledTabLink to="/" tabId="settings">
              Settings
            </FilledTabLink>
          </div>

          <Outlet />
        </TabGroup>
      </div>
    </>
  );
}
