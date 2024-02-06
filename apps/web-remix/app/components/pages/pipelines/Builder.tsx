import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "classnames";
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
  NodeChange,
  EdgeChange,
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
  IConfigConnection,
  IEdge,
  INode,
  IPipeline,
  IPipelineConfig,
} from "./pipeline.types";
import { CustomNodeProps } from "./CustomNodes/CustomNode";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { CustomEdgeProps } from "./CustomEdges/CustomEdge";

interface BuilderProps {
  alias?: string;
  type?: "readOnly" | "editable";
  className?: string;
  pipeline: IPipeline;
  CustomNode: ComponentType<CustomNodeProps>;
  CustomEdge: ComponentType<CustomEdgeProps>;
  isUpdating?: boolean;
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
  onSave?: (config: IPipelineConfig) => void;
}

export const Builder = ({
  pipeline,
  children,
  alias = "latest",
  type = "editable",
  isUpdating,
  CustomNode,
  CustomEdge,
  className,
  onSave,
}: BuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    getNodes(pipeline.config)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<IConfigConnection>(
    getEdges(pipeline.config)
  );

  const isUpToDate = isEqual(toPipelineConfig(nodes, edges), pipeline.config);

  useBeforeUnloadWarning(!isUpToDate);

  const handleOnSave = useCallback(() => {
    if (!isUpToDate) {
      onSave?.(toPipelineConfig(nodes, edges));
    }
  }, [edges, isUpToDate, nodes, onSave]);

  const handleOnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (type === "readOnly") return;
      return onNodesChange(changes);
    },
    [onNodesChange, type]
  );

  const handleOnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      handleOnSave();
      if (type === "readOnly") return;
      return onEdgesChange(changes);
    },
    [handleOnSave, onEdgesChange, type]
  );

  const handleIsValidConnection = useCallback(
    (connection: Connection) =>
      isValidConnection(toPipelineConfig(nodes, edges), connection),
    [edges, nodes]
  );

  const handleDelete = useCallback(
    (node: IBlockConfig) => {
      setEdges((eds) => eds.filter((ed) => ed.source !== node.name));
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name));
    },
    [setNodes, setEdges]
  );

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      const sameBlockTypes = getAllBlockTypes(
        toPipelineConfig(nodes, edges),
        created.type
      );
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${created.type.toLowerCase()}_${nameNum}`;

      created.opts.name = name;

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

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            id: `${params.source}:${params.sourceHandle}-${params.target}:${params.targetHandle}`,
            ...params,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  const PipelineNode = useCallback(
    (props: CustomNodeProps) => (
      <CustomNode
        {...props}
        onDelete={handleDelete}
        disabled={type === "readOnly"}
      />
    ),
    [handleDelete]
  );

  const nodeTypes = useMemo(() => {
    return { custom: PipelineNode };
  }, [PipelineNode]);

  const DefaultEdge = useCallback(
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
    return { default: DefaultEdge };
  }, [DefaultEdge]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  useEffect(() => {
    const currentConfig = toPipelineConfig(nodes, edges);
    if (!isUpdating && !isEqual(currentConfig, pipeline.config)) {
      setNodes(getNodes(pipeline.config));
      setEdges(getEdges(pipeline.config));
    }
  }, [pipeline, isUpdating]);

  return (
    <div
      className={classNames("relative pt-5 w-full", className)}
      ref={reactFlowWrapper}
    >
      <RunPipelineProvider
        alias={alias}
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
            onNodesChange={handleOnNodesChange}
            onEdgesChange={handleOnEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onBlur={handleOnSave}
            onNodeDragStop={handleOnSave}
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
            <Controls showInteractive={false} />
          </ReactFlow>

          {children?.({
            nodes,
            edges,
            isUpToDate,
            onBlockCreate,
          })}
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
