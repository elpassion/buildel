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
import { GenerateGraph } from './components/GenerateGraph';
import { NodePreview } from './components/NodePreview';
import {
  NodePreviewSidebar,
  NodePreviewSidebarContent,
  NodePreviewSidebarHeader,
} from './components/NodePreviewSidebar';

const customNodes = {
  embedding: EmbeddingNode,
};

export function KnowledgeBaseGraphPage() {
  const { graph } = useLoaderData<typeof loader>();
  const [activeNode, setActiveNode] = useState<IEmbeddingNode | null>(null);
  const deferredActiveNode = useDeferredValue(activeNode);

  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<IEmbeddingNode>(
    toEmbeddingNodes(graph.nodes),
  );

  const clearActiveNode = () => {
    setActiveNode(null);
    setEdges([]);
  };

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    if (params.nodes.length === 0) {
      clearActiveNode();
      return;
    }

    setActiveNode(params.nodes[0] as IEmbeddingNode);
  }, []);

  useEffect(() => {
    setNodes(toEmbeddingNodes(graph.nodes));
  }, [graph]);

  return (
    <ActiveNodeProvider value={{ activeNode: deferredActiveNode }}>
      <div className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-3 overflow-hidden">
        <div className="absolute top-4 right-4 z-[10] md:right-6 lg:right-10">
          <GenerateGraph />
        </div>

        <NodePreviewSidebar
          isOpen={!!deferredActiveNode}
          onOpenChange={clearActiveNode}
        >
          <NodePreviewSidebarHeader>
            <h3 className="font-semibold">Node Properties</h3>
          </NodePreviewSidebarHeader>
          <NodePreviewSidebarContent>
            {deferredActiveNode && <NodePreview node={deferredActiveNode} />}
          </NodePreviewSidebarContent>
        </NodePreviewSidebar>

        <ReactFlow<IEmbeddingNode>
          nodes={nodes}
          edges={edges}
          nodesConnectable={false}
          nodesFocusable={false}
          nodesDraggable={false}
          edgesFocusable={false}
          edgesReconnectable={false}
          zoomOnDoubleClick={false}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          //@ts-ignore
          nodeTypes={customNodes}
          minZoom={-2}
          maxZoom={10}
          fitView
          fitViewOptions={{
            minZoom: 0,
            maxZoom: 5,
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
