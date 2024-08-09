import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  IKnowledgeBaseSearchChunk,
  MemoryNodeRelated,
} from '~/api/knowledgeBase/knowledgeApi.contracts';
import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import {
  IEmbeddingNode,
  IPrevNextNode,
} from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.types';
import {
  NEXT_NODE_COLOR,
  PREV_NODE_COLOR,
  SEARCH_NODE_COLOR,
  toEmbeddingNodes,
} from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.utils';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.collectionName, 'collectionName not found');

    const url = new URL(request.url);
    const chunk_id = url.searchParams.get('chunk_id');
    const query = url.searchParams.get('query') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const token_limit =
      typeof url.searchParams.get('token_limit') === 'string'
        ? Number(url.searchParams.get('token_limit'))
        : undefined;
    const extend_neighbors =
      url.searchParams.get('extend_neighbors') === 'true' ?? false;
    const extend_parents =
      url.searchParams.get('extend_parents') === 'true' ?? false;

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const graphPromise = knowledgeBaseApi.getCollectionGraph(
      params.organizationId,
      collectionId,
    );
    const graphStatePromise = knowledgeBaseApi.getCollectionGraphState(
      params.organizationId,
      collectionId,
    );

    const [graph, graphState] = await Promise.all([
      graphPromise,
      graphStatePromise,
    ]);

    const activeChunk =
      graph.data.nodes.find((node) => node.id === chunk_id) ?? null;

    let relatedNeighbours: z.TypeOf<typeof MemoryNodeRelated>['chunks'] = [];
    let prevNode: IPrevNextNode = null;
    let nextNode: IPrevNextNode = null;

    if (activeChunk) {
      const chunkDetailsPromise = knowledgeBaseApi.getGraphChunkDetails(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );
      const relatedNeighboursPromise = knowledgeBaseApi.getRelatedNeighbours(
        params.organizationId,
        collectionId,
        activeChunk.id,
      );

      const [details, neighbours] = await Promise.all([
        chunkDetailsPromise,
        relatedNeighboursPromise,
      ]);

      relatedNeighbours = neighbours.data.chunks;
      prevNode = details.data.prev;
      nextNode = details.data.next;
    }

    let graphSearchChunks: IKnowledgeBaseSearchChunk[] = [];

    const searchParams = {
      query,
      limit,
      token_limit,
      extend_neighbors,
      extend_parents,
    };

    if (query) {
      const { data: searchChunks } =
        await knowledgeBaseApi.searchCollectionChunks(
          params.organizationId,
          collectionId,
          searchParams,
        );
      graphSearchChunks = searchChunks.data;
    }

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      graph: graph.data,
      graphState: graphState.data,
      searchChunks: graphSearchChunks.map((chunk) => chunk.id),
      activeChunk,
      relatedNeighbours,
      prevNode,
      nextNode,
      searchParams,
    });
  })(args);
}

export default function Canvas() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeChunk,
    organizationId,
    graph,
    searchChunks,
    nextNode,
    prevNode,
    relatedNeighbours,
  } = useLoaderData<typeof loader>();

  const isSearched = useCallback(
    (id: string) => {
      return searchChunks.map((searchChunk) => searchChunk).includes(id);
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
          borderColor: node.data.base_color,
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
        return {
          ...node,
          radius: 10,
          x: node.data.point[0] * 50,
          y: node.data.point[1] * 50,
          color: activeStyles(node).backgroundColor,
          borderColor: innerCircleColor(node),
        };
      }),
      links: [],
    };
  }, [graph.nodes]);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div id="_root">
        <ClientOnly fallback={<div>Dupa</div>}>
          {() => <CanvasGraph elements={nodes.nodes} onClick={console.log} />}
        </ClientOnly>
      </div>
    </div>
  );
}

interface CanvasElement<T> {
  x: number;
  y: number;
  color: string;
  borderColor: string;
  radius: number;
  data: T;
}

interface CanvasGraphProps<T> {
  elements: CanvasElement<T>[];
  onClick?: (element: CanvasElement<T>) => void;
}
function CanvasGraph<T = {}>({ elements, onClick }: CanvasGraphProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaleRef = useRef<number>(1);
  const lastPosRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const offsetRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isMouseDown = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const hoveredNodeRef = useRef<CanvasElement<T> | null>(null);

  const getContext = (): CanvasRenderingContext2D | null => {
    return canvasRef.current ? canvasRef.current.getContext('2d') : null;
  };

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const { innerWidth: width, innerHeight: height } = window;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const minX = Math.min(
      ...elements.map((element) => element.x - element.radius),
    );
    const maxX = Math.max(
      ...elements.map((element) => element.x + element.radius),
    );
    const minY = Math.min(
      ...elements.map((element) => element.y - element.radius),
    );
    const maxY = Math.max(
      ...elements.map((element) => element.y + element.radius),
    );

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    const scaleX = canvasWidth / (maxX - minX);
    const scaleY = canvasHeight / (maxY - minY);
    const initialScale = Math.min(scaleX, scaleY) * 0.9;

    const offsetX =
      (canvasWidth - (maxX - minX) * initialScale) / 2 - minX * initialScale;
    const offsetY =
      (canvasHeight - (maxY - minY) * initialScale) / 2 - minY * initialScale;

    offsetRef.current = { x: offsetX, y: offsetY };
    scaleRef.current = initialScale;

    const ctx = getContext();
    if (ctx) {
      drawCanvas(ctx, initialScale, offsetX, offsetY);
    }
  };

  const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    scale: number,
    offsetX: number,
    offsetY: number,
    mousePosition?: { offsetX: number; offsetY: number },
  ) => {
    window.requestAnimationFrame(() => {
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      const hovered = elements
        .slice()
        .reverse()
        .find((element) => {
          const { x, y, radius } = element;
          const node = new Path2D();
          node.arc(x, y, radius, 0, 2 * Math.PI, false);
          const hovered =
            !!mousePosition &&
            ctx.isPointInPath(
              node,
              mousePosition?.offsetX,
              mousePosition?.offsetY,
            );

          return hovered;
        });

      elements.map((element) => {
        const { x, y, radius, color, borderColor } = element;
        const node = new Path2D();
        node.arc(
          x,
          y,
          radius + (element === hovered ? 2 : 0),
          0,
          2 * Math.PI,
          false,
        );
        const newColor = element === hovered ? '#000' : color;

        ctx.strokeStyle = borderColor;
        ctx.stroke(node);

        ctx.fillStyle = newColor;
        ctx.fill(node);
      });

      hoveredNodeRef.current = hovered || null;

      ctx.restore();
    });
  };

  useEffect(() => {
    initializeCanvas();
  }, [elements]);

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = scaleRef.current * (e.deltaY < 0 ? 1.2 : 0.8);

    const newOffsetX =
      mouseX - ((mouseX - offsetRef.current.x) / scaleRef.current) * newScale;
    const newOffsetY =
      mouseY - ((mouseY - offsetRef.current.y) / scaleRef.current) * newScale;

    scaleRef.current = newScale;
    offsetRef.current = { x: newOffsetX, y: newOffsetY };

    const ctx = getContext();
    if (ctx) {
      drawCanvas(ctx, newScale, newOffsetX, newOffsetY, {
        offsetX: mouseX,
        offsetY: mouseY,
      });
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    isMouseDown.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    onDrag(e);
    onMove(e);
  };

  const onDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown.current) return;
    isDraggingRef.current = true;

    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;

    lastPosRef.current = { x: e.clientX, y: e.clientY };

    offsetRef.current = {
      x: offsetRef.current.x + dx,
      y: offsetRef.current.y + dy,
    };

    const ctx = getContext();
    if (ctx) {
      drawCanvas(
        ctx,
        scaleRef.current,
        offsetRef.current.x,
        offsetRef.current.y,
      );
    }
  };

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown.current) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const ctx = getContext();
    if (ctx) {
      drawCanvas(
        ctx,
        scaleRef.current,
        offsetRef.current.x,
        offsetRef.current.y,
        {
          offsetX: mouseX,
          offsetY: mouseY,
        },
      );
    }
  };

  const onMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    if (!isDraggingRef.current && onClick && hoveredNodeRef.current) {
      onClick(hoveredNodeRef.current);
    }
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className={cn('relative top-0 left-0', {
        'cursor-grabbing': isDragging,
        'cursor-grab': !isDragging,
      })}
    />
  );
}
