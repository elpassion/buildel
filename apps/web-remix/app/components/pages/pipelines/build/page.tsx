import React, { useCallback } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { ELProvider } from "~/components/pages/pipelines/EL/ELProvider";
import { ELHelper } from "~/components/pages/pipelines/build/ELHelper";
import { IPipeline, IPipelineConfig } from "../pipeline.types";
import { toPipelineConfig } from "../PipelineFlow.utils";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { PasteBlockConfigProvider } from "./CreateBlock/PasteBlockConfigProvider";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
import { PasteBlockConfiguration } from "./CreateBlock/PastConfigSidebar";
import { EditBlockSidebarProvider } from "./EditBlockSidebarProvider";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { BuilderHeader, SaveChangesButton } from "./BuilderHeader";
import { EditBlockSidebar } from "./EditBlockSidebar";
import { BuilderNode } from "./BuilderNode";
import { loader } from "./loader";

export const links: LinksFunction = () => [...SubMenuLinks()];

export function PipelineBuilder() {
  const revalidator = useRevalidator();
  const updateFetcher = useFetcher<IPipeline>();
  const { pipeline, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  const handleUpdatePipeline = useCallback(
    (config: IPipelineConfig) => {
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json" }
      );
    },
    [updateFetcher, pipeline]
  );

  const handleRevalidate = () => {
    revalidator.revalidate();
  };

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
            <BuilderHeader isUpToDate={isUpToDate}>
              <SaveChangesButton
                isSaving={updateFetcher.state !== "idle"}
                isUpToDate={isUpToDate}
                onSave={() => {
                  handleUpdatePipeline(toPipelineConfig(nodes, edges));
                }}
              />
            </BuilderHeader>

            <ELProvider>
              {/*<ELHelper*/}
              {/*  pipelineId={pipelineId}*/}
              {/*  organizationId={organizationId}*/}
              {/*  onBlockCreate={handleRevalidate}*/}
              {/*/>*/}
              <PasteBlockConfigProvider>
                <CreateBlockFloatingMenu onCreate={onBlockCreate} />

                <PasteBlockConfiguration onSubmit={onBlockCreate} />
              </PasteBlockConfigProvider>
            </ELProvider>

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
