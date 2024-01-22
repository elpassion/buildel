import React from "react";
import cloneDeep from "lodash.clonedeep";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { IBlockConfig, IEdge, INode, IPipelineConfig } from "../pipeline.types";
import { useEditBlockSidebar } from "./EditBlockSidebarProvider";
import { toPipelineConfig } from "../PipelineFlow.utils";
import { EditBlockForm } from "./EditBlockForm";
import { BlockInputList } from "./BlockInputList";

interface EditBlockSidebarProps {
  onSubmit: (config: IPipelineConfig) => void;
  organizationId: number;
  pipelineId: number;
  nodes: INode[];
  edges: IEdge[];
}

export const EditBlockSidebar: React.FC<EditBlockSidebarProps> = ({
  onSubmit,
  organizationId,
  pipelineId,
  nodes,
  edges,
}) => {
  const { editableBlock, closeSidebar } = useEditBlockSidebar();

  const handleSubmit = (updated: IBlockConfig & { oldName: string }) => {
    const tmpNodes = cloneDeep(nodes);
    const tmpEdges = cloneDeep(edges);

    const updatedNodes = tmpNodes.map((node) => {
      if (node.id === updated.oldName) {
        const { oldName, ...rest } = updated;

        node.data = rest;
        node.id = updated.name;
      }

      node.data.connections = node.data.connections.map((connection) => ({
        ...connection,
        from: {
          ...connection.from,
          block_name: connection.from.block_name.replace(
            updated.oldName,
            updated.name
          ),
        },
        to: {
          ...connection.to,
          block_name: connection.to.block_name.replace(
            updated.oldName,
            updated.name
          ),
        },
      }));

      node.data.inputs = node.data.inputs.map((input) =>
        input.replace(updated.oldName, updated.name)
      );

      return node;
    });

    const updatedEdges = tmpEdges.map((edge) => ({
      ...edge,
      id: edge.id.replace(updated.oldName, updated.name),
      source: edge.source.replace(updated.oldName, updated.name),
      target: edge.target.replace(updated.oldName, updated.name),
    }));

    onSubmit(toPipelineConfig(updatedNodes, updatedEdges));
    closeSidebar();
  };

  return (
    <ActionSidebar
      isOpen={!!editableBlock}
      onClose={closeSidebar}
      className="md:w-[460px] lg:w-[500px]"
    >
      {editableBlock ? (
        <>
          <ActionSidebarHeader
            heading={editableBlock.type}
            subheading="Open AI’s Large Language Model chat block."
            onClose={closeSidebar}
          />
          <EditBlockForm
            onSubmit={handleSubmit}
            blockConfig={editableBlock}
            organizationId={organizationId}
            pipelineId={pipelineId}
            nodesNames={nodes.map((node) => node.data.name)}
          >
            <BlockInputList inputs={editableBlock.inputs} />
          </EditBlockForm>
        </>
      ) : null}
    </ActionSidebar>
  );
};
