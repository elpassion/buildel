import React from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Builder } from "~/components/pages/pipelines/builder/Builder";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { loader } from "./loader";

export const links: LinksFunction = () => [...SubMenuLinks()];

export function PipelineBuilder() {
  const { pipeline, blockTypes } = useLoaderData<typeof loader>();

  return <Builder pipeline={pipeline} blockTypes={blockTypes} />;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Builder",
    },
  ];
};
