import React from "react";
import { useLoaderData } from "@remix-run/react";
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import { Navbar } from "@elpassion/taco";
import { loader } from "./loader";
import flowStyles from "reactflow/dist/style.css";
import editorStyles from "~/components/editor/editor.styles.css";
import { Builder } from "~/components/pages/pipelines/show/PipelineBuilder/Builder";
import { TabGroup } from "~/components/tabs/TabGroup";
import { Tab, TabButton } from "~/components/tabs/Tab";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
  { rel: "stylesheet", href: editorStyles },
];

export function ShowPipelinePage() {
  const { pipeline, blockTypes } = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar
        wrapperClassName="md:px-2 md:pt-2"
        leftContent={
          <h1 className="text-2xl font-medium text-white">{pipeline.name}</h1>
        }
      />
      <div className="md:px-10">
        <TabGroup defaultActiveTab="build">
          <div className="bg-neutral-800 flex gap-2 rounded-xl w-fit p-1">
            <TabButton
              className="text-xs rounded-lg text-neutral-100 py-2 px-3"
              tabId="overview"
            >
              Overview
            </TabButton>
            <TabButton
              className="text-xs bg-neutral-900 rounded-lg text-white py-2 px-3"
              tabId="build"
            >
              Build
            </TabButton>
            <TabButton
              className="text-xs rounded-lg text-neutral-100 py-2 px-3"
              tabId="interface"
            >
              Interface
            </TabButton>
            <TabButton
              className="text-xs rounded-lg text-neutral-100 py-2 px-3"
              tabId="settings"
            >
              Settings
            </TabButton>
          </div>

          <Tab tabId="overview">Overview</Tab>
          <Tab tabId="build">
            <Builder pipeline={pipeline} blockTypes={blockTypes} />
          </Tab>
          <Tab tabId="interface">Interface</Tab>
          <Tab tabId="settings">Settings</Tab>
        </TabGroup>
      </div>
    </>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Show pipeline",
    },
  ];
};
