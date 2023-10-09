import { useCallback, useMemo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { Icon } from "@elpassion/taco";
import { useRunPipelineEdge } from "../RunPipelineProvider";
import classNames from "classnames";

export interface CustomEdgeProps extends EdgeProps {
  onDelete: (id: string) => void;
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
  markerEnd,
  onDelete,
}: CustomEdgeProps) {
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
          strokeDasharray: 5,
          animation: "dashdraw 0.2s linear infinite",
        }
      : {};
  }, [status]);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, []);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
        style={{
          ...style,
          strokeWidth: "1",
          stroke: selected ? "#DE8411" : "#fff",
          ...statusStyles,
        }}
      />

      <path
        id={`${id}-invisible`}
        className="peer react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        strokeWidth={20}
        strokeOpacity={0}
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
          disabled={status !== "idle"}
          onClick={handleDelete}
          className={classNames(
            "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white text-xs flex justify-center items-center bg-red-700 w-4 h-4 rounded-full outline outline-3 outline-red-500/30",
            {
              "opacity-0": status !== "idle",
            }
          )}
        >
          <Icon iconName="x" />
        </button>
      </foreignObject>
    </>
  );
}
