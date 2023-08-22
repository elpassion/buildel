'use client';

import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  EdgeChange,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import { useDebounce } from 'usehooks-ts';
import { z } from 'zod';
import { AddBlockForm } from '~/modules/Pages';
import { AddBlockModal } from '~/modules/Pages/PipelinePage/AddBlockModal';
import {
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines';
import {
  IEdge,
  INode,
  IPipelineConfig,
  getEdges,
  getNodes,
  toPipelineConfig,
} from '~/modules/Pipelines/PipelineGraph';
import {
  BlockConfig,
  IBlockTypesObj,
  IPipeline,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { useModal } from '~/utils/hooks';
import { CustomNode } from './CustomNode';
import 'reactflow/dist/style.css';

interface PipelineBoardProps extends PropsWithChildren {
  pipelineId: string;
  initialData?: IPipeline;
}

export function PipelineBoard({
  pipelineId,
  initialData,
  children,
}: PipelineBoardProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const { data: blockTypes } = useBlockTypes();
  const { data: pipeline, isLoading } = usePipeline(pipelineId, {
    initialData,
  });
  const updatePipeline = useUpdatePipeline(pipelineId);

  const handleUpdate = useCallback(
    (updated: IPipelineConfig) => {
      assert(pipeline);

      updatePipeline.mutate({
        config: { version: pipeline.config.version, ...updated },
        name: pipeline.name,
      });
    },
    [pipeline],
  );

  const handleAddBlock = useCallback(
    (data: z.TypeOf<typeof BlockConfig>) => {
      assert(pipeline);
      console.log(data);
      updatePipeline.mutate({
        name: pipeline.name,
        config: {
          version: pipeline.config.version,
          blocks: [...pipeline.config.blocks, data],
        },
      });
    },
    [pipeline],
  );

  if (isLoading) return <p>Loading...</p>;
  if (!pipeline || !blockTypes) return;

  return (
    <div className="relative h-[90vh] w-full">
      <PipelineFlow
        pipeline={pipeline}
        blockTypes={blockTypes}
        onUpdate={handleUpdate}
      />
      {children}
      <div className="absolute left-0 top-0">
        <button onClick={openModal}>TMP ADD</button>
      </div>

      <AddBlockModal isOpen={isModalOpen} onClose={closeModal}>
        <AddBlockForm onSubmit={handleAddBlock} />
      </AddBlockModal>
    </div>
  );
}

interface PipelineFlowProps {
  pipeline: IPipeline;
  blockTypes: IBlockTypesObj;
  onUpdate?: (updated: IPipelineConfig) => void;
}

export function PipelineFlow({
  pipeline,
  blockTypes,
  onUpdate,
}: PipelineFlowProps) {
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
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds) as IEdge[]),
    [setEdges],
  );

  const nodeTypes = useMemo(() => {
    return Object.keys(blockTypes).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: CustomNode,
      }),
      {},
    );
  }, [blockTypes]);

  useEffect(() => {
    onUpdate?.(toPipelineConfig(debouncedNodes, debouncedEdges));
  }, [debouncedEdges, debouncedNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
