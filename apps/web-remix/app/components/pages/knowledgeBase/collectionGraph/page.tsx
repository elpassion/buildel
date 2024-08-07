import React, { useCallback, useEffect, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import type { Edge, OnSelectionChangeParams } from '@xyflow/react';
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import test from '~/MICHALJESTSMIESZNY.json';
import { getRandomNumber } from '~/utils/numbers';

import { ActiveNodeProvider } from './activeNodeProvider';
import type { EmbeddingNode } from './collectionGraph.types';
import { EmbeddingCustomNode } from './components/EmbeddingCustomNode';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

const customNodes = {
  embedding: EmbeddingCustomNode,
};

export function KnowledgeBaseGraphPage() {
  const [activeNode, setActiveNode] = useState<EmbeddingNode | null>(null);

  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [nodes, _, onNodesChange] = useNodesState<EmbeddingNode>(
    test.map((item: any) => ({
      id: item.id,
      position: { x: item.point[0] * 30, y: item.point[1] * 30 },
      data: {
        ...item,
        document_id: getRandomNumber(0, 3).toFixed(0).toString(),
      },
      type: 'embedding',
    })),
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    if (params.nodes.length === 0) {
      setActiveNode(null);
      setEdges([]);
      return;
    }

    setActiveNode(params.nodes[0] as EmbeddingNode);
  }, []);

  useEffect(() => {
    if (!activeNode) return;

    const fetchEdges = async (node: EmbeddingNode) => {
      const data = nodes.filter(
        (item) => item.data.document_id === node.data.document_id,
      );

      setEdges(
        data.map((item) => ({
          target: node.id,
          source: item.id,
          id: item.id + node.id,
        })),
      );
    };

    fetchEdges(activeNode);
  }, [activeNode]);

  return (
    <ActiveNodeProvider value={{ activeNode }}>
      <div className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-3">
        <ReactFlow<EmbeddingNode>
          nodesConnectable={false}
          nodesFocusable={false}
          nodesDraggable={false}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          //@ts-ignore
          nodeTypes={customNodes}
          minZoom={-2}
          maxZoom={10}
        >
          <Background />
          <Controls />
          {/*<SelectionChangeListener />*/}
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
