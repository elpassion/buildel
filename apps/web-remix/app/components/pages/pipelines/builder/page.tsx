import React, { useCallback } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { IPipeline, IPipelineConfig } from "../pipeline.types";
import { toPipelineConfig } from "../PipelineFlow.utils";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { BlockInputList } from "./BlockInputList";
import { EditBlockForm } from "./EditBlockForm";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderNode } from "./BuilderNode";
import { loader } from "./loader";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

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
    <Builder
      pipeline={pipeline}
      onUpdate={handleUpdatePipeline}
      CustomNode={BuilderNode}
      CustomEdge={CustomEdge}
    >
      {({
        edges,
        nodes,
        isUpToDate,
        onBlockCreate,
        editableBlock,
        onSidebarClose,
        onEdit,
      }) => (
        <>
          <BuilderHeader
            isUpToDate={isUpToDate}
            onSave={() => {
              handleUpdatePipeline(toPipelineConfig(nodes, edges));
            }}
          />
          <CreateBlockFloatingMenu onCreate={onBlockCreate} />

          <ActionSidebar isOpen={!!editableBlock} onClose={onSidebarClose}>
            {editableBlock ? (
              <>
                <ActionSidebarHeader
                  heading={editableBlock.type}
                  subheading="Open AI’s Large Language Model chat block."
                  onClose={onSidebarClose}
                />
                <EditBlockForm
                  onSubmit={onEdit}
                  blockConfig={editableBlock}
                  organizationId={pipeline.organization_id}
                  pipelineId={pipeline.id}
                >
                  <BlockInputList inputs={editableBlock.inputs} />
                </EditBlockForm>
              </>
            ) : null}
          </ActionSidebar>
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
