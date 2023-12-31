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

  const handleSubmit = (updated: IBlockConfig) => {
    const tmpNodes = cloneDeep(nodes);
    const updatedNodes = tmpNodes.map((node) => {
      if (node.id === updated.name) {
        node.data = updated;
      }
      return node;
    });
    onSubmit(toPipelineConfig(updatedNodes, edges));
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
          >
            <BlockInputList inputs={editableBlock.inputs} />
          </EditBlockForm>
        </>
      ) : null}
    </ActionSidebar>
  );
};
