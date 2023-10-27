import React, { useCallback } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { IPipeline, IPipelineConfig } from "../pipeline.types";
import { toPipelineConfig } from "../PipelineFlow.utils";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
import { EditBlockSidebarProvider } from "./EditBlockSidebarProvider";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { EditBlockSidebar } from "./EditBlockSidebar";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderNode } from "./BuilderNode";
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
    <EditBlockSidebarProvider>
      <Builder
        pipeline={pipeline}
        CustomNode={BuilderNode}
        CustomEdge={CustomEdge}
        className="h-[calc(100vh_-_128px)]"
      >
        {({ edges, nodes, isUpToDate, onBlockCreate }) => (
          <>
            <BuilderHeader
              isUpToDate={isUpToDate}
              isSaving={updateFetcher.state !== "idle"}
              onSave={() => {
                handleUpdatePipeline(toPipelineConfig(nodes, edges));
              }}
            />

            <CreateBlockFloatingMenu onCreate={onBlockCreate} />

            <EditBlockSidebar
              nodes={nodes}
              edges={edges}
              pipelineId={pipeline.id}
              onSubmit={handleUpdatePipeline}
              organizationId={pipeline.organization_id}
            />
          </>
        )}
      </Builder>
    </EditBlockSidebarProvider>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Build",
    },
  ];
};
