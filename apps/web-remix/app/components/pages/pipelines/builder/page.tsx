import React, { useCallback } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
import { IPipeline, IPipelineConfig } from "../pipeline.types";
import { toPipelineConfig } from "./PipelineFlow.utils";
import { BuilderHeader } from "./BuilderHeader";
import { Builder } from "./Builder";
import { loader } from "./loader";

export const links: LinksFunction = () => [...SubMenuLinks()];

export function PipelineBuilder() {
  const updateFetcher = useFetcher<IPipeline>();
  const { pipeline } = useLoaderData<typeof loader>();

  const handleUpdatePipeline = useCallback(
    (config: IPipelineConfig) => {
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json" }
      );
    },
    [updateFetcher, pipeline]
  );

  return (
    <Builder pipeline={pipeline} onUpdate={handleUpdatePipeline}>
      {({ edges, nodes, isUpToDate, onBlockCreate }) => (
        <>
          <BuilderHeader
            isUpToDate={isUpToDate}
            onSave={() => {
              const config = toPipelineConfig(nodes, edges);
              handleUpdatePipeline(config);
            }}
          />
          <CreateBlockFloatingMenu onCreate={onBlockCreate} />
        </>
      )}
    </Builder>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Builder",
    },
  ];
};
