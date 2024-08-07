import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import type { MetaFunction } from '@remix-run/node';
import type { Edge, OnSelectionChangeParams } from '@xyflow/react';
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import { ActiveNodeProvider } from './activeNodeProvider';
import type { IEmbeddingNode } from './collectionGraph.types';
import { EmbeddingNode } from './components/EmbeddingNode';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

import { useLoaderData } from '@remix-run/react';

import { toEmbeddingNodes } from './collectionGraph.utils';

const customNodes = {
  embedding: EmbeddingNode,
};

export function KnowledgeBaseGraphPage() {
  const { graph } = useLoaderData<typeof loader>();
  const [activeNode, setActiveNode] = useState<IEmbeddingNode | null>(null);
  const deferredActiveNode = useDeferredValue(activeNode);

  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [nodes, _, onNodesChange] = useNodesState<IEmbeddingNode>(
    toEmbeddingNodes(graph.nodes),
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    if (params.nodes.length === 0) {
      setActiveNode(null);
      setEdges([]);
      return;
    }

    setActiveNode(params.nodes[0] as IEmbeddingNode);
  }, []);

  useEffect(() => {
    if (!deferredActiveNode) return;

    const fetchEdges = async (node: IEmbeddingNode) => {
      const data = nodes.filter(
        (item) => item.data.memory_id === node.data.memory_id,
      );

      setEdges(
        data.map((item) => ({
          target: node.id,
          source: item.id,
          id: item.id + node.id,
        })),
      );
    };

    fetchEdges(deferredActiveNode);
  }, [deferredActiveNode]);

  return (
    <ActiveNodeProvider value={{ activeNode: deferredActiveNode }}>
      <div className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-3">
        <ReactFlow<IEmbeddingNode>
          nodesConnectable={false}
          nodesFocusable={false}
          nodesDraggable={false}
          zoomOnDoubleClick={false}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          //@ts-ignore
          nodeTypes={customNodes}
          minZoom={-2}
          maxZoom={10}
          fitView
          fitViewOptions={{
            minZoom: 0.5,
            maxZoom: 1,
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ActiveNodeProvider>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Graph`,
    },
  ];
};
