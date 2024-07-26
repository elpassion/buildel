import { useCallback, useMemo } from 'react';
import { getBezierPath, useReactFlow } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

import { useRunPipelineEdge } from '../../RunPipelineProvider';

import './customEdges.styles.css';

import { X } from 'lucide-react';

import { cn } from '~/utils/cn';

export interface CustomEdgeProps extends EdgeProps {
  disabled?: boolean;
}

const foreignObjectSize = 24;
export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  disabled = false,
}: CustomEdgeProps) {
  const { status } = useRunPipelineEdge();
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const statusStyles = useMemo(() => {
    return status === 'running'
      ? {
          strokeDasharray: 5,
          animation: 'dashdraw 0.2s linear infinite',
        }
      : {};
  }, [status]);

  const handleDelete = useCallback(async () => {
    await deleteElements({ edges: [{ id }] });
  }, []);

  const handlePathClick = (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    if (!disabled) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <path
        id={id}
        data-testid="builder-edge"
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        onClick={handlePathClick}
        style={{
          ...style,
          strokeWidth: '1',
          stroke: selected ? '#DE8411' : '#ccc',
          ...statusStyles,
        }}
      />

      <path
        id={`${id}-invisible`}
        className="peer react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        strokeWidth={20}
        strokeOpacity={0}
        onClick={handlePathClick}
      />

      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        className="relative transition opacity-0 peer-hover:opacity-100 hover:opacity-100"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          disabled={status !== 'idle' || disabled}
          onClick={handleDelete}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white text-xs flex justify-center items-center bg-red-700 w-4 h-4 rounded-full outline outline-3 outline-red-500/30',
            {
              'opacity-0': status !== 'idle' || disabled,
            },
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </foreignObject>
    </>
  );
}
