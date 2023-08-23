import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import { useDebounce } from 'usehooks-ts';
import {
  BlockModal,
  BlockModalHeader,
} from '~/modules/Pages/PipelinePage/BlockModal';
import { EditBlockForm } from '~/modules/Pages/PipelinePage/EditBlockForm';
import {
  getEdges,
  getNodes,
  isValidConnection,
  toPipelineConfig,
} from '~/modules/Pipelines/PipelineGraph';
import {
  IBlockConfig,
  IBlockTypesObj,
  IEdge,
  INode,
  IPipeline,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { useModal } from '~/utils/hooks';
import { CustomNode, CustomNodeProps } from './CustomNodes/CustomNode';
import { PipelineSidebar } from './PipelineSidebar/PipelineSidebar';
import { useDraggableNodes } from './PipelineSidebar/useDraggableNodes';

interface PipelineFlowProps {
  pipeline: IPipeline;
  blockTypes: IBlockTypesObj;
  onUpdate?: (updated: IPipelineConfig) => void;
  onCreate?: (created: IBlockConfig) => Promise<IPipelineConfig>;
}

export function PipelineFlow({
  pipeline,
  blockTypes,
  onUpdate,
  onCreate,
}: PipelineFlowProps) {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);
  const [nodes, setNodes] = useState<INode[]>(getNodes(pipeline.config));
  const [edges, setEdges] = useState<IEdge[]>(getEdges(pipeline.config));
  const debouncedNodes = useDebounce(nodes, 1000);
  const debouncedEdges = useDebounce(edges, 1000);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds) as INode[]),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds) as IEdge[]);
    },
    [setEdges],
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds) as IEdge[]);
  }, []);

  const onBlockUpdate = useCallback(
    (updated: IBlockConfig) => {
      setNodes((prev) => {
        return prev.map((node) => {
          if (node.id === updated.name) {
            node.data = updated;
          }
          return node;
        });
      });
      handleCloseModal();
    },
    [setNodes],
  );

  const onBlockCreate = useCallback(
    async (created: IBlockConfig) => {
      assert(onCreate);

      const newConfig = await onCreate(created);

      setNodes(getNodes(newConfig));

      handleCloseModal();
    },
    [setNodes, onCreate],
  );

  const handleDelete = useCallback(
    (node: IBlockConfig) =>
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name)),
    [setNodes],
  );

  const handleEditBlock = useCallback((block: IBlockConfig) => {
    setEditableBlock(block);
    openModal();
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditableBlock(null);
    closeModal();
  }, []);

  //todo Do not define customNode during render
  const nodeTypes = useMemo(() => {
    return Object.keys(blockTypes).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: (props: CustomNodeProps) => (
          <CustomNode
            {...props}
            onUpdate={handleEditBlock}
            onDelete={handleDelete}
          />
        ),
      }),
      {},
    );
  }, [blockTypes]);

  useEffect(() => {
    if (!onUpdate) return;
    onUpdate(toPipelineConfig(debouncedNodes, debouncedEdges));
  }, [debouncedEdges, debouncedNodes]);

  const { onDragOver, onDrop, onInit } = useDraggableNodes({
    wrapper: reactFlowWrapper,
    onDrop: onBlockCreate,
  });

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        isValidConnection={(connection) =>
          isValidConnection(pipeline.config, connection)
        }
        fitView
      >
        <Background variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>

      <PipelineSidebar />

      <BlockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header={
          <BlockModalHeader
            heading={editableBlock ? 'Edit Block' : 'Add Block'}
            description="Blocks are modules within your app that can work simultaneously."
          />
        }
      >
        {editableBlock && (
          <EditBlockForm onSubmit={onBlockUpdate} blockConfig={editableBlock} />
        )}
      </BlockModal>
    </div>
  );
}
