import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IBlockConfig,
  IEdge,
  INode,
  IPipeline,
  IPipelineConfig,
} from "../pipeline.types";
import { useModal } from "~/hooks/useModal";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import { CustomNode, CustomNodeProps } from "./CustomNodes/CustomNode";
import isEqual from "lodash.isequal";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { EditBlockForm } from "./EditBlockForm";
import { BlockInputList } from "./BlockInputList";
import { CustomEdge } from "./CustomEdges/CustomEdge";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { useBeforeUnloadWarning } from "~/hooks/useBeforeUnloadWarning";

interface BuilderProps {
  pipeline: IPipeline;
  onUpdate?: (config: IPipelineConfig) => void;
  children?: ({
    nodes,
    edges,
    isUpToDate,
    onBlockCreate,
  }: {
    nodes: INode[];
    edges: IEdge[];
    isUpToDate: boolean;
    onBlockCreate: (created: IBlockConfig) => Promise<void>;
  }) => ReactNode;
}

export const Builder = ({ pipeline, children, onUpdate }: BuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const {
    isModalOpen: isSidebarOpen,
    openModal: openSidebar,
    closeModal: closeSidebar,
  } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    getNodes(pipeline.config)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    getEdges(pipeline.config)
  );

  const isUpToDate = isEqual(toPipelineConfig(nodes, edges), pipeline.config);

  useBeforeUnloadWarning(!isUpToDate);

  const handleIsValidConnection = useCallback(
    (connection: Connection) =>
      isValidConnection(toPipelineConfig(nodes, edges), connection),
    [edges, nodes]
  );

  const handleDelete = useCallback(
    (node: IBlockConfig) =>
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name)),
    [setNodes]
  );

  const handleEditBlock = useCallback(
    (block: IBlockConfig) => {
      setEditableBlock(block);
      openSidebar();
    },
    [openSidebar]
  );

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeSidebar();
  }, [closeSidebar]);

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      const sameBlockTypes = getAllBlockTypes(
        toPipelineConfig(nodes, edges),
        created.type
      );
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${created.type.toLowerCase()}_${nameNum}`;

      const newBlock = {
        id: name,
        type: "custom",
        position: created.position ?? { x: 100, y: 100 },
        data: { ...created, name },
      };

      setNodes((prev) => [...prev, newBlock]);
    },
    [setNodes, nodes, edges]
  );

  const onBlockUpdate = useCallback(
    (updated: IBlockConfig) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === updated.name) {
          node.data = updated;
        }
        return node;
      });
      setNodes(updatedNodes);

      onUpdate?.(toPipelineConfig(updatedNodes, edges));
      handleCloseModal();
    },
    [edges, onUpdate, nodes, setNodes]
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  const PipelineNode = useCallback(
    (props: CustomNodeProps) => (
      <CustomNode
        {...props}
        onUpdate={handleEditBlock}
        onDelete={handleDelete}
      />
    ),
    [handleDelete]
  );

  const nodeTypes = useMemo(() => {
    return { custom: PipelineNode };
  }, [PipelineNode]);

  const PipelineEdge = useCallback(
    (props: EdgeProps) => <CustomEdge {...props} onDelete={handleDeleteEdge} />,
    [handleDeleteEdge]
  );

  const edgeTypes = useMemo(() => {
    return { default: PipelineEdge };
  }, [PipelineEdge]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  return (
    <div
      className="relative pt-5 h-[calc(100vh_-_128px)] w-full"
      ref={reactFlowWrapper}
    >
      <RunPipelineProvider
        pipeline={{ ...pipeline, config: toPipelineConfig(nodes, edges) }}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            isValidConnection={handleIsValidConnection}
            fitViewOptions={{
              minZoom: 0.5,
              maxZoom: 1,
            }}
            fitView
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={35}
              color="#aaa"
              className="bg-black rounded-lg"
            />
            <Controls />
          </ReactFlow>

          <ActionSidebar
            isOpen={!!editableBlock || isSidebarOpen}
            onClose={handleCloseModal}
          >
            {editableBlock ? (
              <>
                <ActionSidebarHeader
                  heading={editableBlock.type}
                  subheading="Open AI’s Large Language Model chat block."
                  onClose={handleCloseModal}
                />
                <EditBlockForm
                  onSubmit={onBlockUpdate}
                  blockConfig={editableBlock}
                  organizationId={pipeline.organization_id}
                  pipelineId={pipeline.id}
                >
                  <BlockInputList inputs={editableBlock.inputs} />
                </EditBlockForm>
              </>
            ) : null}
          </ActionSidebar>

          {children?.({ nodes, edges, isUpToDate, onBlockCreate })}
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
