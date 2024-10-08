import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';

import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';

import {
  getColorForUid,
  NEXT_NODE_COLOR,
  PREV_NODE_COLOR,
  SEARCH_NODE_COLOR,
} from './collectionGraph.utils';
import { GenerateGraph } from './components/GenerateGraph';
import {
  NodePreviewSidebar,
  NodePreviewSidebarContent,
  NodePreviewSidebarHeader,
} from './components/NodePreviewSidebar';
import type { loader } from './loader.server';

import '@xyflow/react/dist/style.css';

import { useSearchedChunks } from '~/components/pages/knowledgeBase/collectionGraph/useSearchedChunks';
import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { errorToast } from '~/components/toasts/errorToast';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { ChunksSearch } from './components/ChunksSearch';
import { EmbeddingCanvas, type CanvasLink } from './components/EmbeddingCanvas';
import { SearchChunksList } from './components/SearchChunkList';
import { useRelatedChunks } from './useRelatedChunks';

export function KnowledgeBaseGraphPage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    collectionId,
    graph,
    graphState,
    collectionName,
    organizationId,
    activeChunk,
    prevNode,
    nextNode,
    searchParams,
    fileList,
  } = useLoaderData<typeof loader>();

  const { searchChunks } = useSearchedChunks({
    searchParams,
    organizationId,
    collectionId,
    onError: () => errorToast('Ups! Something went wrong'),
  });
  const { neighbors: relatedNeighbours } = useRelatedChunks({
    organizationId,
    collectionId,
    activeChunk,
    onError: () => errorToast('Ups! Something went wrong'),
  });
  const [hoveredNodes, setHoveredNodes] = useState<(string | number)[]>([]);

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
    (node: IMemoryNode) => {
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
      return relatedNeighbours.includes(id) || hoveredNodes.includes(id);
    },
    [relatedNeighbours, hoveredNodes],
  );
  const isActive = useCallback(
    (id: string) => {
      return activeChunk?.id === id;
    },
    [activeChunk],
  );

  const activeStyles = useCallback(
    (node: IMemoryNode) => {
      const id = node.id.toString();
      const baseColor = getColorForUid(node.memory_id.toString());
      if (
        isSearched(id) ||
        isActive(id) ||
        prevNode === id ||
        nextNode === id ||
        (!activeChunk && searchChunks.length === 0)
      ) {
        return {
          backgroundColor: baseColor,
          opacity: 1,
        };
      } else if (isRelated(id)) {
        return {
          backgroundColor: baseColor,
          opacity: 0.8,
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
    (node: IMemoryNode) => {
      const baseColor = getColorForUid(node.memory_id.toString());
      if (prevNode === node.id.toString()) return PREV_NODE_COLOR;
      if (nextNode === node.id.toString()) return NEXT_NODE_COLOR;
      if (isSearched(node.id.toString())) return SEARCH_NODE_COLOR;
      return baseColor;
    },
    [prevNode, nextNode, isSearched],
  );

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    return graph.nodes.map((node) => {
      const styles = activeStyles(node);
      const spaceRatio = getNodesSpace(graph.nodes.length);
      return {
        ...node,
        radius: 10,
        x: node.point[0] * spaceRatio,
        y: node.point[1] * spaceRatio,
        color: styles.backgroundColor,
        borderColor: innerCircleColor(node),
        opacity: styles.opacity,
      };
    });
  }, [graph.nodes, activeStyles]);

  const onMouseOver = useCallback(
    (
      id: string,
      options: { highlightAllMemoryNodes?: string | number } = {},
    ) => {
      setHoveredNode(id);
      if (options.highlightAllMemoryNodes) {
        const newNodes = nodes
          .filter((node) => node.memory_id == options.highlightAllMemoryNodes)
          .map((node) => node.id);
        setHoveredNodes(newNodes);
      }
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setHoveredNodes([]);
  }, []);

  const links = useMemo(() => {
    if (!activeChunk) return [];
    const links: CanvasLink[] = [];

    if (prevNode) {
      links.push({
        source: prevNode.toString(),
        target: activeChunk.id.toString(),
      });
    }

    if (nextNode) {
      links.push({
        source: activeChunk.id.toString(),
        target: nextNode.toString(),
      });
    }

    return links;
  }, [prevNode, nextNode, activeChunk]);

  return (
    <div
      className="h-[calc(100vh_-_170px_-_34px_)] w-full relative lg:-top-2 overflow-hidden"
      ref={wrapperRef}
    >
      <div className="flex justify-between items-start gap-4 absolute top-4 right-4 left-4 z-[12] md:right-6 md:left-4 lg:right-10 lg:left-10 pointer-events-none bg-transparent">
        <div>
          <ChunksSearch defaultValue={searchParams} fileList={fileList} />
          <SearchChunksList
            searchChunks={searchChunks}
            onChunkSelect={selectNode}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
          />
        </div>
        <GenerateGraph state={graphState} />
      </div>

      <NodePreviewSidebar isOpen={isNewSidebarOpen} onOpenChange={closeSidebar}>
        <NodePreviewSidebarHeader>
          <h3 className="font-semibold">Node Properties</h3>
        </NodePreviewSidebarHeader>
        <NodePreviewSidebarContent>
          <Outlet context={{ onMouseOver, onMouseLeave }} />
        </NodePreviewSidebarContent>
      </NodePreviewSidebar>

      <ClientOnly fallback="">
        {() =>
          nodes.length > 0 ? (
            <EmbeddingCanvas
              elements={nodes}
              activeElement={hoveredNode}
              links={links}
              onClick={onClick}
              wrapper={wrapperRef.current}
            />
          ) : null
        }
      </ClientOnly>
    </div>
  );
}

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `${data?.collectionName} Graph`,
      },
    ];
  },
);

function getNodesSpace(size: number) {
  return 25 + Math.floor(size / 1000) * 15;
}
