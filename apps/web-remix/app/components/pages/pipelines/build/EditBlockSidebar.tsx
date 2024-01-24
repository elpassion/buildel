import React from "react";
import cloneDeep from "lodash.clonedeep";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import {
  IBlockConfig,
  IBlockConfigConnection,
  IEdge,
  INode,
  IPipelineConfig,
} from "../pipeline.types";
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

type IExtendedBlockConfig = IBlockConfig & { oldName: string };

export const EditBlockSidebar: React.FC<EditBlockSidebarProps> = ({
  onSubmit,
  organizationId,
  pipelineId,
  nodes,
  edges,
}) => {
  const { editableBlock, closeSidebar } = useEditBlockSidebar();

  const handleSubmit = (updated: IExtendedBlockConfig) => {
    const tmpNodes = cloneDeep(nodes);
    const tmpEdges = cloneDeep(edges);

    const updatedNodes = tmpNodes.map((node) => updateNode(node, updated));
    const updatedEdges = tmpEdges.map((edge) => updateEdge(edge, updated));

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
            subheading={editableBlock.block_type.description}
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

function updateConnectionEnd<T>(
  end: { block_name: string } & T,
  updated: IExtendedBlockConfig
) {
  return {
    ...end,
    block_name:
      end.block_name === updated.oldName ? updated.name : end.block_name,
  };
}

function updateConnection(
  connection: IBlockConfigConnection,
  updated: IExtendedBlockConfig
) {
  return {
    ...connection,
    from: updateConnectionEnd(connection.from, updated),
    to: updateConnectionEnd(connection.to, updated),
  };
}

function updateInput(input: string, updated: IExtendedBlockConfig) {
  const parts = input.split(":");
  return parts[0] === updated.oldName ? `${updated.name}:${parts[1]}` : input;
}

function updateEdge(edge: IEdge, updated: IExtendedBlockConfig) {
  const updatedEdge = { ...edge };

  if (edge.source === updated.oldName) {
    updatedEdge.source = updated.name;
  }
  if (edge.target === updated.oldName) {
    updatedEdge.target = updated.name;
  }

  return {
    ...updatedEdge,
    id: `${updatedEdge.source}:${updatedEdge.sourceHandle}-${updatedEdge.target}:${updatedEdge.targetHandle}`,
  };
}

function updateNode(node: INode, updated: IExtendedBlockConfig) {
  if (node.id === updated.oldName) {
    const { oldName, ...rest } = updated;
    node.data = rest;
    node.id = updated.name;
  }

  node.data.connections = node.data.connections.map((connection) =>
    updateConnection(connection, updated)
  );
  node.data.inputs = node.data.inputs.map((input) =>
    updateInput(input, updated)
  );
  return node;
}
