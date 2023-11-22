import { useCallback, useMemo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { Icon } from "@elpassion/taco";
import { useRunPipelineEdge } from "../RunPipelineProvider";
import classNames from "classnames";

export interface IOEdgeProps extends EdgeProps {
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const foreignObjectSize = 24;
export function IOEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  markerEnd,
  markerStart,
  onDelete,
  disabled = false,
}: IOEdgeProps) {
  const { status } = useRunPipelineEdge();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const statusStyles = useMemo(() => {
    return status === "running"
      ? {
          animation: "dashdraw 0.2s linear infinite",
        }
      : {};
  }, [status]);

  const handleDelete = useCallback(() => {
    onDelete(id);
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
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
        onClick={handlePathClick}
        style={{
          ...style,
          strokeWidth: "1",
          stroke: selected ? "#DE8411" : "#fff",
          strokeDasharray: 5,
          ...statusStyles,
        }}
      />

      <path
        id={`${id}-invisible`}
        className="peer react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        markerStart={markerStart}
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
          disabled={status !== "idle" || disabled}
          onClick={handleDelete}
          className={classNames(
            "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white text-xs flex justify-center items-center bg-red-700 w-4 h-4 rounded-full outline outline-3 outline-red-500/30",
            {
              "opacity-0": status !== "idle" || disabled,
            }
          )}
        >
          <Icon iconName="x" />
        </button>
      </foreignObject>
    </>
  );
}
