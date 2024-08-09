import React, { useEffect, useRef, useState } from 'react';

import { cn } from '~/utils/cn';

export interface CanvasElement {
  id: string | number;
  x: number;
  y: number;
  color: string;
  borderColor: string;
  radius: number;
  opacity: number;
}

interface EmbeddingCanvasProps {
  elements: CanvasElement[];
  hoveredElement?: string | null;
  onClick?: (element: CanvasElement) => void;
  wrapper?: HTMLElement | null;
}
export function EmbeddingCanvas({
  elements,
  onClick,
  wrapper,
  hoveredElement,
}: EmbeddingCanvasProps) {
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
  const hoveredNodeRef = useRef<CanvasElement | null>(null);

  const getContext = (): CanvasRenderingContext2D | null => {
    return canvasRef.current ? canvasRef.current.getContext('2d') : null;
  };

  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    const { innerWidth: width, innerHeight: height } = window;
    canvasRef.current.width = wrapper ? wrapper.offsetWidth : width;
    canvasRef.current.height = wrapper ? wrapper.offsetHeight : height;

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
            hoveredElement === element.id ||
            (!!mousePosition &&
              ctx.isPointInPath(
                node,
                mousePosition?.offsetX,
                mousePosition?.offsetY,
              ));

          return hovered;
        });

      elements.forEach((element) => {
        const { x, y, radius, color, borderColor, opacity } = element;
        const node = new Path2D();
        node.arc(
          x,
          y,
          element === hovered ? radius + 2 : radius,
          0,
          2 * Math.PI,
          false,
        );
        const newColor = element === hovered ? '#000' : color;
        ctx.globalAlpha = opacity;
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
    if (!hoveredElement) return;

    const ctx = getContext();
    if (ctx) {
      drawCanvas(
        ctx,
        scaleRef.current,
        offsetRef.current.x,
        offsetRef.current.y,
      );
    }
  }, [hoveredElement]);

  useEffect(() => {
    initializeCanvas();
  }, []);

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
