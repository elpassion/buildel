import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
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
  getEdges,
  getNodes,
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
import { CustomNode, CustomNodeProps } from './CustomNodes/CustomNode';

interface PipelineFlowProps {
  pipeline: IPipeline;
  blockTypes: IBlockTypesObj;
  onUpdate?: (updated: IPipelineConfig) => void;
  onEditBlock?: (block: IBlockConfig) => void;
}

export function PipelineFlow({
  pipeline,
  blockTypes,
  onUpdate,
  onEditBlock,
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
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds) as IEdge[]);
    },
    [setEdges],
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds) as IEdge[]);
  }, []);

  const handleDelete = useCallback(
    (node: IBlockConfig) =>
      setNodes((nds) => nds.filter((nd) => nd.id !== node.name)),
    [setNodes],
  );

  //todo Do not define customNode during render
  const nodeTypes = useMemo(() => {
    return Object.keys(blockTypes).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: (props: CustomNodeProps) => (
          <CustomNode
            {...props}
            onUpdate={onEditBlock}
            onDelete={handleDelete}
          />
        ),
      }),
      {},
    );
  }, [blockTypes]);
  //Think about better solution
  useEffect(() => {
    setNodes(getNodes(pipeline.config));
    setEdges(getEdges(pipeline.config));
  }, [pipeline.config]);

  useEffect(() => {
    if (!onUpdate) return;
    onUpdate(toPipelineConfig(debouncedNodes, debouncedEdges));
  }, [debouncedEdges, debouncedNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
