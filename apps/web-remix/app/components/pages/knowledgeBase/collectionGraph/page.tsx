import React, { useCallback, useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';

import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';

import type { IEmbeddingNode } from './collectionGraph.types';
import {
  NEXT_NODE_COLOR,
  PREV_NODE_COLOR,
  SEARCH_NODE_COLOR,
  toEmbeddingNodes,
} from './collectionGraph.utils';
import { GenerateGraph } from './components/GenerateGraph';
import {
  NodePreviewSidebar,
  NodePreviewSidebarContent,
  NodePreviewSidebarHeader,
} from './components/NodePreviewSidebar';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { routes } from '~/utils/routes.utils';

import { ChunksSearch } from './components/ChunksSearch';
import { EmbeddingCanvas } from './components/EmbeddingCanvas';
import {
  clearStyles,
  queryNode,
  setStyles,
} from './details/components/NodePreview';

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

  const onClick = useCallback(
    (node: IEmbeddingNode) => {
      navigate(
        routes.collectionGraphDetails(organizationId, collectionName, {
          chunk_id: node.id,
          ...searchParams,
        }),
      );
    },
    [searchParams],
  );

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

  const isSearched = useCallback(
    (id: string) => {
      return searchChunks.map((searchChunk) => searchChunk.id).includes(id);
    },
    [searchChunks],
  );
  const isRelated = useCallback(
    (id: string) => {
      return relatedNeighbours.includes(id);
    },
    [relatedNeighbours],
  );
  const isActive = useCallback(
    (id: string) => {
      return activeChunk?.id === id;
    },
    [activeChunk],
  );

  const activeStyles = useCallback(
    (node: IEmbeddingNode) => {
      if (!activeChunk && searchChunks.length === 0) {
        return {
          backgroundColor: node.data.base_color,
          opacity: 1,
        };
      } else if (
        isSearched(node.data.id.toString()) ||
        isActive(node.data.id.toString()) ||
        prevNode === node.data.id.toString() ||
        nextNode === node.data.id.toString()
      ) {
        return {
          backgroundColor: node.data.base_color,
          opacity: 1,
        };
      } else if (isRelated(node.data.id.toString())) {
        return {
          backgroundColor: node.data.base_color,
          opacity: 0.5,
        };
      } else {
        return {
          backgroundColor: '#aaa',
          opacity: 0.2,
        };
      }
    },
    [activeChunk, searchChunks, isSearched, isActive, isRelated],
  );

  const innerCircleColor = useCallback(
    (node: IEmbeddingNode) => {
      if (prevNode === node.data.id.toString()) return PREV_NODE_COLOR;
      if (nextNode === node.data.id.toString()) return NEXT_NODE_COLOR;
      if (isSearched(node.data.id.toString())) return SEARCH_NODE_COLOR;
      return node.data.base_color;
    },
    [prevNode, nextNode, isSearched],
  );

  const nodes = useMemo(() => {
    return {
      nodes: toEmbeddingNodes(graph.nodes).map((node) => {
        const styles = activeStyles(node);
        return {
          ...node,
          radius: 10,
          x: node.data.point[0] * 50,
          y: node.data.point[1] * 50,
          color: styles.backgroundColor,
          borderColor: innerCircleColor(node),
          opacity: styles.opacity,
        };
      }),
      links: [],
    };
  }, [graph.nodes]);

  return (
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

      <NodePreviewSidebar isOpen={isNewSidebarOpen} onOpenChange={closeSidebar}>
        <NodePreviewSidebarHeader>
          <h3 className="font-semibold">Node Properties</h3>
        </NodePreviewSidebarHeader>
        <NodePreviewSidebarContent>
          <Outlet />
        </NodePreviewSidebarContent>
      </NodePreviewSidebar>
      <ClientOnly fallback={<div>Dupa</div>}>
        {() => <EmbeddingCanvas elements={nodes.nodes} onClick={onClick} />}
      </ClientOnly>
    </div>
  );
}

function SearchChunksList({
  searchChunks,
  onChunkSelect,
}: {
  searchChunks: IKnowledgeBaseSearchChunk[];
  onChunkSelect: (id: string) => void;
}) {
  const onMouseEnter = useCallback((id: string) => {
    if (!id) return;
    const node = queryNode(id);

    if (!node) return;
    setStyles(node);
  }, []);

  const onMouseLeave = useCallback((id: string) => {
    if (!id) return;
    const node = queryNode(id);

    if (!node) return;
    clearStyles(node);
  }, []);

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
              onMouseEnter={() => onMouseEnter(chunk.id)}
              onMouseLeave={() => onMouseLeave(chunk.id)}
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
