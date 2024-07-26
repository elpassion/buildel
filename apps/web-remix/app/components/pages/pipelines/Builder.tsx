import type { ComponentType, FunctionComponent, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useLocation,
  useNavigate,
  useOutlet,
  useSearchParams,
} from '@remix-run/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type {
  Connection,
  Edge,
  EdgeChange,
  EdgeProps,
  NodeChange,
  NodeProps,
} from '@xyflow/react';
import { useEventListener } from 'usehooks-ts';

import { useUndoRedo } from '~/hooks/useUndoRedo';
import { buildUrlWithParams } from '~/utils/url';

import type { CustomEdgeProps } from './CustomEdges/CustomEdge';
import type { CustomNodeProps } from './CustomNodes/CustomNode';
import type {
  IBlockConfig,
  IEdge,
  IExtendedPipeline,
  INode,
} from './pipeline.types';
import {
  getAllBlockTypes,
  getEdges,
  getLastBlockNumber,
  getNodes,
  getNodeType,
  isValidConnection,
  toPipelineConfig,
} from './PipelineFlow.utils';
import { RunPipelineProvider } from './RunPipelineProvider';
import { useCopyPasteNode } from './useCopyPasteNode';
import { useDraggableNodes } from './useDraggableNodes';

import '@xyflow/react/dist/style.css';

import { BuilderControls } from '~/components/pages/pipelines/BuilderControls';
import { CommentNode } from '~/components/pages/pipelines/CommentNode/CommentNode';
import { cn } from '~/utils/cn';

import { CreateNodeDropdown } from './CreateNodeDropdown/CreateNodeDropdown';
import { useNodeDropdown } from './CreateNodeDropdown/useNodeDropdown';

interface BuilderProps {
  alias?: string;
  type?: 'readOnly' | 'editable';
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
    onBlockCreate: (created: IBlockConfig) => Promise<unknown>;
  }) => ReactNode;
}

export const Builder = (props: BuilderProps) => {
  return (
    <ReactFlowProvider>
      <BuilderInstance {...props} />
    </ReactFlowProvider>
  );
};

const BuilderInstance = ({
  pipeline,
  children,
  alias = 'latest',
  type = 'editable',
  CustomNode,
  CustomEdge,
  className,
}: BuilderProps) => {
  const outletData = useOutlet();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [flowState, setFlowState, { updateCurrent, undo, redo }] = useUndoRedo({
    initial: {
      nodes: getNodes(pipeline.config),
      edges: getEdges(pipeline.config),
    },
  });

  useEventListener('keydown', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      !!outletData
    ) {
      return;
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'z' || e.key === 'Z') &&
      e.shiftKey
    ) {
      redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      undo();
    }
  });

  const onNodesChange = useCallback(
    (changes: NodeChange<INode>[]) => {
      if (type === 'readOnly') return;
      if (['select', 'position', 'dimensions'].includes(changes[0].type)) {
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
    (changes: EdgeChange<IEdge>[]) => {
      if (type === 'readOnly') return;
      if (['select'].includes(changes[0].type)) {
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
          data: {
            from: {
              block_name: params.source,
              output_name: params.sourceHandle!,
            },
            to: {
              block_name: params.target,
              input_name: params.targetHandle!,
            },
            opts: {
              reset: true,
            },
          },
          id: `${params.source}:${params.sourceHandle}-${params.target}:${params.targetHandle}`,
          ...params,
        },
        state.edges,
      ),
    }));
  }, []);

  const handleIsValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!isConnection(connection)) return false;

      return isValidConnection(
        toPipelineConfig(flowState.nodes, flowState.edges),
        connection,
      );
    },
    [flowState],
  );

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      const sameBlockTypes = getAllBlockTypes(
        toPipelineConfig(flowState.nodes, flowState.edges),
        created.type,
      );
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${created.type.toLowerCase()}_${nameNum}`;

      created.opts.name = name;

      const newBlock: INode = {
        id: name,
        type: getNodeType(created.type),
        position: created.position ?? { x: 100, y: 100 },
        data: { ...created, name },
        selected: false,
      };

      setFlowState((state) => ({
        ...state,
        nodes: [...state.nodes, newBlock],
      }));

      return newBlock;
    },
    [flowState.nodes],
  );

  useEffect(() => {
    if (location.state?.reset) {
      navigate(
        buildUrlWithParams('.', Object.fromEntries(searchParams.entries())),
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
    allowCopyPaste: () => !outletData,
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

  const PipelineNode: FunctionComponent<NodeProps<INode>> = useCallback(
    (props: NodeProps<INode>) => (
      <CustomNode {...props} disabled={type === 'readOnly'} />
    ),
    [],
  );

  const nodeTypes = useMemo(() => {
    return { custom: PipelineNode, comment: CommentNode };
  }, [PipelineNode]);

  const DefaultEdge = useCallback(
    (props: EdgeProps) => (
      <CustomEdge {...props} disabled={type === 'readOnly'} />
    ),
    [type],
  );

  const edgeTypes = useMemo(() => {
    return { default: DefaultEdge };
  }, [DefaultEdge]);

  const {
    ref: dropdownRef,
    onConnectEnd,
    onConnectStart,
    onContextMenu,
    position,
    isOpen,
    create,
    blockGroups,
  } = useNodeDropdown({ onConnect, onCreate: onBlockCreate });

  return (
    <div
      id="react-flow-wrapper"
      onContextMenu={onContextMenu}
      data-testid="workflow-builder"
      className={cn('relative pt-5 w-full', className)}
      ref={reactFlowWrapper}
    >
      <CreateNodeDropdown
        ref={dropdownRef}
        open={isOpen}
        position={position}
        blockGroups={blockGroups}
        create={create}
      />

      <RunPipelineProvider
        alias={alias}
        pipeline={{
          ...pipeline,
          config: toPipelineConfig(flowState.nodes, flowState.edges),
        }}
      >
        <ReactFlow<INode, IEdge>
          edgesUpdatable={type !== 'readOnly'}
          edgesFocusable={type !== 'readOnly'}
          nodesDraggable={type !== 'readOnly'}
          nodesConnectable={type !== 'readOnly'}
          nodesFocusable={type !== 'readOnly'}
          nodes={flowState.nodes}
          edges={flowState.edges}
          onMouseMove={onMouseMove}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          //@ts-ignore
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
            color="#aaa"
            className="!bg-muted"
          />

          <BuilderControls
            nodes={flowState.nodes}
            edges={flowState.edges}
            setFlowData={setFlowState}
          />
        </ReactFlow>

        {children?.({
          nodes: flowState.nodes,
          edges: flowState.edges,
          onBlockCreate,
        })}
      </RunPipelineProvider>
    </div>
  );
};

function isConnection(edge: Edge | Connection): edge is Connection {
  return (edge as Connection).source !== undefined;
}
