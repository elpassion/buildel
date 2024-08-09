import React, { useCallback, useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import type { OnSelectionChangeParams } from '@xyflow/react';
import { Background, ReactFlow, useNodesState } from '@xyflow/react';
import isEqual from 'lodash.isequal';

import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';

import { ActiveNodeProvider } from './activeNodeProvider';
import type { IEmbeddingNode } from './collectionGraph.types';
import {
  generateActiveNodeEdges,
  toEmbeddingNodes,
} from './collectionGraph.utils';
import { EmbeddingNode } from './components/EmbeddingNode';
import { GenerateGraph } from './components/GenerateGraph';
import {
  NodePreviewSidebar,
  NodePreviewSidebarContent,
  NodePreviewSidebarHeader,
} from './components/NodePreviewSidebar';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

import { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { routes } from '~/utils/routes.utils';

import { ChunksSearch } from './components/ChunksSearch';

const customNodes = {
  embedding: EmbeddingNode,
};

export function KnowledgeBaseGraphPage() {
  const navigate = useNavigate();
  const {
    graph,
    graphState,
    searchChunks,
    collectionName,
    organizationId,
    activeChunk,
    relatedNeighbours,
    prevNode,
    nextNode,
    searchParams,
  } = useLoaderData<typeof loader>();

  const [nodes, setNodes, onNodesChange] = useNodesState<IEmbeddingNode>(
    toEmbeddingNodes(graph.nodes),
  );

  const matchDetails = useMatch(
    '/:organization_id/knowledge-base/:collection_name/graph/details',
  );
  const isNewSidebarOpen = !!matchDetails;

  const closeSidebar = () => {
    navigate(
      routes.collectionGraph(organizationId, collectionName, searchParams),
    );
  };

  useRevalidateOnInterval({ enabled: graphState.state !== 'idle' });

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (params.nodes.length === 0) return;
      const node = params.nodes[0] as IEmbeddingNode;
      navigate(
        routes.collectionGraphDetails(organizationId, collectionName, {
          chunk_id: node.id,
          ...searchParams,
        }),
      );
    },
    [searchParams],
  );

  useEffect(() => {
    const updated = toEmbeddingNodes(graph.nodes);
    if (isEqual(nodes, updated)) return;

    setNodes(updated);
  }, [graph]);

  const selectNode = useCallback(
    (nodeId: string) => {
      navigate(
        routes.collectionGraphDetails(organizationId, collectionName, {
          chunk_id: nodeId,
          ...searchParams,
        }),
      );
    },
    [searchParams],
  );

  return (
    <ActiveNodeProvider
      value={{
        searchChunks,
        prevNode,
        nextNode,
        activeNode: activeChunk,
        relatedNeighbours: relatedNeighbours,
      }}
    >
      <div className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-3 overflow-hidden">
        <div className="flex justify-between items-start gap-6 absolute top-4 right-4 left-4 z-[12] md:right-6 md:left-4 lg:right-10 lg:left-10 pointer-events-none bg-transparent">
          <div>
            <ChunksSearch defaultValue={searchParams} />
            <SearchChunksList
              searchChunks={searchChunks}
              onChunkSelect={selectNode}
            />
          </div>
          <GenerateGraph state={graphState} />
        </div>

        <NodePreviewSidebar
          isOpen={isNewSidebarOpen}
          onOpenChange={closeSidebar}
        >
          <NodePreviewSidebarHeader>
            <h3 className="font-semibold">Node Properties</h3>
          </NodePreviewSidebarHeader>
          <NodePreviewSidebarContent>
            <Outlet />
          </NodePreviewSidebarContent>
        </NodePreviewSidebar>

        <ReactFlow<IEmbeddingNode>
          nodes={nodes}
          edges={generateActiveNodeEdges(activeChunk?.id, prevNode, nextNode)}
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
        </ReactFlow>
      </div>
    </ActiveNodeProvider>
  );
}

function SearchChunksList({
  searchChunks,
  onChunkSelect,
}: {
  searchChunks: IKnowledgeBaseSearchChunk[];
  onChunkSelect: (id: string) => void;
}) {
  return (
    searchChunks.length > 0 && (
      <div className="relative w-full max-w-[350px] max-h-[200px] overflow-y-auto overflow-x-hidden pointer-events-auto bg-white border border-input p-2 rounded-lg flex flex-col">
        {searchChunks.map((chunk) => {
          return (
            <button
              className="hover:bg-muted p-1 rounded-sm text-xs"
              onClick={() => {
                onChunkSelect(chunk.id);
              }}
              key={chunk.id}
            >
              <div className="whitespace-nowrap truncate w-full">
                {chunk.file_name}
              </div>
              <div className="whitespace-nowrap truncate w-full">
                {chunk.keywords.toString()}
              </div>
              <div className="whitespace-nowrap truncate w-full">
                Pages: {chunk.pages.toString()}
              </div>
            </button>
          );
        })}
      </div>
    )
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Graph`,
    },
  ];
};
