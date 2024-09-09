import type { ComponentType, ReactNode } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react';
import { useEventListener } from 'usehooks-ts';

import { useUndoRedo } from '~/hooks/useUndoRedo';
import { buildUrlWithParams } from '~/utils/url';

import type { CustomEdgeProps } from './Edges/CustomEdges/CustomEdge';
import type { CustomNodeProps } from './Nodes/CustomNodes/CustomNode';
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
import { RunPipelineProvider, useRunPipeline } from './RunPipelineProvider';
import { useCopyPasteNode } from './useCopyPasteNode';
import { useDraggableNodes } from './useDraggableNodes';

import '@xyflow/react/dist/style.css';

import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { fillSchemaDefaults } from '~/components/form/schema/SchemaParser';
import { BuilderControls } from '~/components/pages/pipelines/BuilderControls';
import { useLayoutNodes } from '~/components/pages/pipelines/useLayoutNodes';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';

import { NodeDropdown } from './NodeDropdown/NodeDropdown';
import { useNodeDropdown } from './NodeDropdown/useNodeDropdown';

interface BuilderProps {
  alias?: string;
  type?: 'readOnly' | 'editable';
  className?: string;
  pipeline: IExtendedPipeline;
  CustomNodes: Record<string, ComponentType<CustomNodeProps>>;
  CustomEdges: Record<string, ComponentType<CustomEdgeProps>>;
  children?: ({
    nodes,
    edges,
    onBlockCreate,
  }: {
    nodes: INode[];
    edges: IEdge[];
    onBlockCreate: (created: IBlockConfig) => Promise<unknown>;
  }) => ReactNode;
  sidebar?: ({
    onBlockCreate,
  }: {
    onBlockCreate: (created: IBlockConfig) => Promise<unknown>;
  }) => ReactNode;
}

export const Builder = ({
  alias = 'latest',
  pipeline,
  ...rest
}: BuilderProps) => {
  const [flowState, setFlowState, { updateCurrent, undo, redo }] = useUndoRedo({
    initial: {
      nodes: getNodes(pipeline.config),
      edges: getEdges(pipeline.config),
    },
  });

  return (
    <ReactFlowProvider>
      <RunPipelineProvider
        alias={alias}
        pipeline={{
          ...pipeline,
          config: toPipelineConfig(flowState.nodes, flowState.edges),
        }}
      >
        <BuilderInstance
          {...rest}
          alias={alias}
          flowState={flowState}
          setFlowState={setFlowState}
          updateCurrent={updateCurrent}
          undo={undo}
          redo={redo}
        />

        <StateRefresher pipeline={pipeline} setFlowData={setFlowState} />
      </RunPipelineProvider>
    </ReactFlowProvider>
  );
};
type UseUndoRedoReturnType<T> = ReturnType<typeof useUndoRedo<T>>;

type BuilderInstanceProps = Omit<BuilderProps, 'pipeline'> & {
  flowState: UseUndoRedoReturnType<{ nodes: INode[]; edges: IEdge[] }>[0];
  setFlowState: UseUndoRedoReturnType<{ nodes: INode[]; edges: IEdge[] }>[1];
  updateCurrent: UseUndoRedoReturnType<{
    nodes: INode[];
    edges: IEdge[];
  }>[2]['updateCurrent'];
  undo: UseUndoRedoReturnType<{ nodes: INode[]; edges: IEdge[] }>[2]['undo'];
  redo: UseUndoRedoReturnType<{ nodes: INode[]; edges: IEdge[] }>[2]['redo'];
};

const BuilderInstance = ({
  children,
  type = 'editable',
  CustomNodes,
  CustomEdges,
  className,
  flowState,
  setFlowState,
  updateCurrent,
  undo,
  redo,
  sidebar,
}: BuilderInstanceProps) => {
  const pipelineId = usePipelineId();
  const organizationId = useOrganizationId();
  const outletData = useOutlet();
  const { status: runStatus } = useRunPipeline();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const isDisabled = runStatus !== 'idle' || type === 'readOnly';

  useEventListener('keydown', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      !!outletData ||
      isDisabled
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
      if (isDisabled && changes[0]?.type !== 'select') return;
      if (['select', 'position', 'dimensions'].includes(changes[0]?.type)) {
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
    [isDisabled],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<IEdge>[]) => {
      if (isDisabled) return;
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
    [isDisabled],
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

      const newBlock: INode = {
        id: name,
        type: getNodeType(created.type),
        position: created.position ?? { x: 100, y: 100 },
        data: {
          ...created,
          ...fillSchemaDefaults(
            created.block_type!.schema as JSONSchemaField,
            { ...created, name },
            {
              organization_id: organizationId,
              pipeline_id: pipelineId,
              block_name: name,
            },
          ),
        },
        selected: false,
        measured: created.measured,
      };

      setFlowState((state) => ({
        ...state,
        nodes: [...state.nodes, newBlock],
      }));

      return newBlock;
    },
    [flowState.nodes],
  );

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

  const nodeTypes = useMemo(() => {
    return CustomNodes;
  }, []);

  const edgeTypes = useMemo(() => {
    return CustomEdges;
  }, []);

  const {
    ref: dropdownRef,
    onConnectEnd,
    onConnectStart,
    onContextMenu,
    position,
    isOpen,
    onClick,
    options,
  } = useNodeDropdown({
    onConnect,
    onCreate: onBlockCreate,
    disabled: isDisabled,
  });

  return (
    <>
      <div
        id="react-flow-wrapper"
        onContextMenu={onContextMenu}
        data-testid="workflow-builder"
        className={cn('relative pt-5 w-full', className)}
        ref={reactFlowWrapper}
      >
        {sidebar?.({ onBlockCreate })}

        <NodeDropdown
          ref={dropdownRef}
          open={isOpen}
          position={position}
          options={options}
          onClick={onClick}
        />

        <ReactFlow<INode, IEdge>
          edgesUpdatable={!isDisabled}
          edgesFocusable={!isDisabled}
          nodesDraggable={type === 'editable'}
          // elementsSelectable={!isDisabled}
          nodesConnectable={!isDisabled}
          nodesFocusable={!isDisabled}
          edgesReconnectable={!isDisabled}
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
          //@ts-ignore
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
      </div>
    </>
  );
};

interface StateRefresherProps {
  pipeline: IExtendedPipeline;
  setFlowData: (
    cb:
      | { nodes: INode[]; edges: IEdge[] }
      | ((oldState: { nodes: INode[]; edges: IEdge[] }) => {
          nodes: INode[];
          edges: IEdge[];
        }),
  ) => void;
}

function StateRefresher({ setFlowData, pipeline }: StateRefresherProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fitView } = useReactFlow();
  const { layout } = useLayoutNodes({ setFlowData, fitView });

  useEffect(() => {
    if (location.state?.reset || searchParams.get('reset') === 'true') {
      const nodes = getNodes(pipeline.config);
      const edges = getEdges(pipeline.config);

      if (location.state?.layoutNodes) {
        layout({ nodes, edges }, 'LR');
      } else {
        setFlowData({
          nodes,
          edges,
        });
      }

      searchParams.delete('reset');
      navigate(
        buildUrlWithParams('.', Object.fromEntries(searchParams.entries())),
        { state: null },
      );
    }
  }, [pipeline, location, searchParams]);

  return null;
}

function isConnection(edge: Edge | Connection): edge is Connection {
  return (edge as Connection).source !== undefined;
}
