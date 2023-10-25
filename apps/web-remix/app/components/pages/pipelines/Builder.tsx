import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import isEqual from "lodash.isequal";
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
import { useBeforeUnloadWarning } from "~/hooks/useBeforeUnloadWarning";
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from "./PipelineFlow.utils";
import {
  IBlockConfig,
  IEdge,
  INode,
  IPipeline,
  IPipelineConfig,
} from "./pipeline.types";
import { CustomNodeProps } from "./CustomNodes/CustomNode";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { CustomEdgeProps } from "./CustomEdges/CustomEdge";
import { BlockConfig } from "./contracts";

interface BuilderProps {
  type?: "readOnly" | "editable";
  pipeline: IPipeline;
  onUpdate?: (config: IPipelineConfig) => void;
  CustomNode: ComponentType<CustomNodeProps>;
  CustomEdge: ComponentType<CustomEdgeProps>;
  children?: ({
    nodes,
    edges,
    isUpToDate,
    onBlockCreate,
    editableBlock,
    onSidebarClose,
    onEdit,
  }: {
    nodes: INode[];
    edges: IEdge[];
    isUpToDate: boolean;
    editableBlock: IBlockConfig | null;
    onSidebarClose: () => void;
    onEdit: (data: z.TypeOf<typeof BlockConfig>) => void;
    onBlockCreate: (created: IBlockConfig) => Promise<void>;
  }) => ReactNode;
}

export const Builder = ({
  pipeline,
  children,
  onUpdate,
  type = "editable",
  CustomNode,
  CustomEdge,
}: BuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
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

  const handleEditBlock = useCallback((block: IBlockConfig) => {
    setEditableBlock(block);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
  }, []);

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
        disabled={type === "readOnly"}
      />
    ),
    [handleDelete]
  );

  const nodeTypes = useMemo(() => {
    return { custom: PipelineNode };
  }, [PipelineNode]);

  const PipelineEdge = useCallback(
    (props: EdgeProps) => (
      <CustomEdge
        {...props}
        onDelete={handleDeleteEdge}
        disabled={type === "readOnly"}
      />
    ),
    [handleDeleteEdge, type]
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
            edgesUpdatable={type !== "readOnly"}
            edgesFocusable={type !== "readOnly"}
            nodesDraggable={type !== "readOnly"}
            nodesConnectable={type !== "readOnly"}
            nodesFocusable={type !== "readOnly"}
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

          {children?.({
            nodes,
            edges,
            isUpToDate,
            onBlockCreate,
            editableBlock,
            onSidebarClose: handleCloseModal,
            onEdit: onBlockUpdate,
          })}
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
