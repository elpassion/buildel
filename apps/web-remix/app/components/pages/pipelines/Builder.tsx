import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "classnames";
import { useEventListener } from "usehooks-ts";
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
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { buildUrlWithParams } from "~/utils/url";
import { useUndoRedo } from "~/hooks/useUndoRedo";
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
} from "./pipeline.types";
import { CustomNodeProps } from "./CustomNodes/CustomNode";
import { useDraggableNodes } from "./useDraggableNodes";
import { RunPipelineProvider } from "./RunPipelineProvider";
import { CustomEdgeProps } from "./CustomEdges/CustomEdge";
import { useCopyPasteNode } from "./useCopyPasteNode";

import "reactflow/dist/style.css";

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
}

export const Builder = ({
  pipeline,
  children,
  alias = "latest",
  type = "editable",
  CustomNode,
  CustomEdge,
  className,
}: BuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [flowState, setFlowState, { updateCurrent, undo, redo }] = useUndoRedo({
    initial: {
      nodes: getNodes(pipeline.config),
      edges: getEdges(pipeline.config),
    },
  });

  useEventListener("keydown", (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;

    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "z" || e.key === "Z") &&
      e.shiftKey
    ) {
      redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      undo();
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (type === "readOnly") return;
      if (["select", "position", "dimensions"].includes(changes[0].type)) {
        updateCurrent((state) => ({
          ...state,
          nodes: applyNodeChanges(changes, state.nodes),
        }));
      } else {
        setFlowState((state) => ({
          ...state,
          nodes: applyNodeChanges(changes, state.nodes),
        }));
      }
    },
    [type],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (type === "readOnly") return;
      if (["select"].includes(changes[0].type)) {
        updateCurrent((state) => ({
          ...state,
          edges: applyEdgeChanges(changes, state.edges),
        }));
      } else {
        setFlowState((state) => ({
          ...state,
          edges: applyEdgeChanges(changes, state.edges),
        }));
      }
    },
    [type],
  );

  const onConnect = useCallback((params: Connection) => {
    setFlowState((state) => ({
      ...state,
      edges: addEdge(
        {
          id: `${params.source}:${params.sourceHandle}-${params.target}:${params.targetHandle}`,
          ...params,
        },
        state.edges,
      ),
    }));
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setFlowState((state) => ({
      ...state,
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  }, []);

  const handleIsValidConnection = useCallback(
    (connection: Connection) =>
      isValidConnection(
        toPipelineConfig(flowState.nodes, flowState.edges),
        connection,
      ),
    [flowState],
  );

  const handleDelete = useCallback((node: IBlockConfig) => {
    setFlowState((state) => ({
      nodes: state.nodes.filter((nd) => nd.id !== node.name),
      edges: state.edges.filter(
        (ed) =>
          ed.data?.from.block_name !== node.name &&
          ed.data?.to.block_name !== node.name,
      ),
    }));
  }, []);

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      const sameBlockTypes = getAllBlockTypes(
        toPipelineConfig(flowState.nodes, flowState.edges),
        created.type,
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

      setFlowState((state) => ({
        ...state,
        nodes: [...state.nodes, newBlock],
      }));
    },
    [flowState.nodes],
  );

  useEffect(() => {
    if (location.state?.reset) {
      navigate(
        buildUrlWithParams(".", Object.fromEntries(searchParams.entries())),
        { state: null },
      );

      setFlowState({
        nodes: getNodes(pipeline.config),
        edges: getEdges(pipeline.config),
      });
    }
  }, [pipeline, location, searchParams]);

  const onNodeDragStartStop = useCallback((_: unknown, node: INode) => {
    setFlowState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((nd) => {
        if (nd.id !== node.id) return nd;

        return { ...node, dragging: false };
      }),
    }));
  }, []);

  const { onInit: onInitCopyPaste, onMouseMove } = useCopyPasteNode({
    wrapper: reactFlowWrapper,
    onPaste: onBlockCreate,
    nodes: flowState.nodes,
  });

  const {
    onDragOver,
    onDrop,
    onInit: onInitDraggable,
  } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  const PipelineNode = useCallback(
    (props: NodeProps) => (
      <CustomNode
        {...props}
        onDelete={handleDelete}
        disabled={type === "readOnly"}
      />
    ),
    [handleDelete],
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
    [handleDeleteEdge, type],
  );

  const edgeTypes = useMemo(() => {
    return { default: DefaultEdge };
  }, [DefaultEdge]);

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
          config: toPipelineConfig(flowState.nodes, flowState.edges),
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            edgesUpdatable={type !== "readOnly"}
            edgesFocusable={type !== "readOnly"}
            nodesDraggable={type !== "readOnly"}
            nodesConnectable={type !== "readOnly"}
            nodesFocusable={type !== "readOnly"}
            nodes={flowState.nodes}
            edges={flowState.edges}
            onMouseMove={onMouseMove}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStart={onNodeDragStartStop}
            onNodeDragStop={onNodeDragStartStop}
            // onBlur={handleOnSave}
            isValidConnection={handleIsValidConnection}
            onInit={(instance) => {
              onInitCopyPaste(instance);
              onInitDraggable(instance);
            }}
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
            nodes: flowState.nodes,
            edges: flowState.edges,
            onBlockCreate,
          })}
        </ReactFlowProvider>
      </RunPipelineProvider>
    </div>
  );
};
