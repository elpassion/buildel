import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "classnames";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeProps,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  NodeProps,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
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
  IExtendedPipeline,
  INode,
  IPipelineConfig,
} from "./pipeline.types";
import { CustomNodeProps } from "./CustomNodes/CustomNode";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { CustomEdgeProps } from "./CustomEdges/CustomEdge";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { buildUrlWithParams } from "~/utils/url";
import "reactflow/dist/style.css";
import { useUndoRedo } from "./useUndoRedo";

interface BuilderProps {
  alias?: string;
  type?: "readOnly" | "editable";
  className?: string;
  pipeline: IExtendedPipeline;
  CustomNode: ComponentType<CustomNodeProps>;
  CustomEdge: ComponentType<CustomEdgeProps>;
  children?: ({
    nodes,
    edges,
    onBlockCreate,
  }: {
    nodes: INode[];
    edges: IEdge[];
    onBlockCreate: (created: IBlockConfig) => Promise<void>;
  }) => ReactNode;
  onSave?: (config: IPipelineConfig) => void;
}

export const Builder = ({
  pipeline,
  children,
  alias = "latest",
  type = "editable",

  CustomNode,
  CustomEdge,
  className,
  onSave,
}: BuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { state, setState, allowUndo, allowRedo, undo, redo } = useUndoRedo({
    nodes: getNodes(pipeline.config),
    edges: getEdges(pipeline.config),
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleOnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (type === "readOnly") return;

      const ignore = ["select", "position", "dimensions"].includes(
        changes[0].type
      );

      setState(
        (state) => ({
          ...state,
          nodes: applyNodeChanges(changes, state.nodes),
        }),
        ignore
      );
    },
    [setState, type]
  );

  const handleOnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (type === "readOnly") return;
      const ignore = ["select"].includes(changes[0].type);

      setState(
        (state) => ({
          ...state,
          edges: applyEdgeChanges(changes, state.edges),
        }),
        ignore
      );
    },
    [setState, type]
  );

  const handleIsValidConnection = useCallback(
    (connection: Connection) =>
      isValidConnection(toPipelineConfig(state.nodes, state.edges), connection),
    [state]
  );

  const handleDelete = useCallback((node: IBlockConfig) => {
    setState((state) => ({
      ...state,
      nodes: state.nodes.filter((nd) => nd.id !== node.name),
    }));
  }, []);

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      const sameBlockTypes = getAllBlockTypes(
        toPipelineConfig(state.nodes, state.edges),
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

      setState((state) => ({
        ...state,
        nodes: [...state.nodes, newBlock],
      }));
    },
    [setState, state.nodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setState((state) => ({
        ...state,
        edges: addEdge(
          {
            id: `${params.source}:${params.sourceHandle}-${params.target}:${params.targetHandle}`,
            ...params,
          },
          state.edges
        ),
      }));
    },
    [setState]
  );

  const handleDeleteEdge = useCallback((id: string) => {
    setState((state) => ({
      ...state,
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  }, []);

  const PipelineNode = useCallback(
    (props: NodeProps) => (
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
    if (location.state?.reset) {
      navigate(
        buildUrlWithParams(".", Object.fromEntries(searchParams.entries())),
        { state: null }
      );

      setState(() => ({
        nodes: getNodes(pipeline.config),
        edges: getEdges(pipeline.config),
      }));
    }
  }, [pipeline, location, searchParams]);

  return (
    <div
      data-testid="workflow-builder"
      className={classNames("relative pt-5 w-full", className)}
      ref={reactFlowWrapper}
    >
      <RunPipelineProvider
        alias={alias}
        pipeline={{
          ...pipeline,
          config: toPipelineConfig(state.nodes, state.edges),
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            edgesUpdatable={type !== "readOnly"}
            edgesFocusable={type !== "readOnly"}
            nodesDraggable={type !== "readOnly"}
            nodesConnectable={type !== "readOnly"}
            nodesFocusable={type !== "readOnly"}
            nodes={state.nodes}
            edges={state.edges}
            onNodesChange={handleOnNodesChange}
            onEdgesChange={handleOnEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            // onNodeDragStop={(e, a, b) => console.log("STOP", e, a, b)}
            // onBlur={handleOnSave}
            isValidConnection={handleIsValidConnection}
            fitViewOptions={{
              minZoom: 0.5,
              maxZoom: 1,
            }}
            fitView
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              color="#666"
              className="bg-black rounded-lg"
            />
            <Controls showInteractive={false} />
          </ReactFlow>

          {children?.({
            nodes: state.nodes,
            edges: state.edges,
            onBlockCreate,
          })}

          <div className="absolute top-0 right-1/2 flex gap-3">
            <button
              disabled={!allowUndo}
              onClick={undo}
              className="disabled:bg-red-500"
            >
              Undo
            </button>

            <button
              disabled={!allowRedo}
              onClick={redo}
              className="disabled:bg-red-500"
            >
              Redo
            </button>
          </div>
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
