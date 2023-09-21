import { IBlockConfig } from "../../pipeline.types";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import { useRunPipelineEdge } from "~/components/pages/pipelines/builder/RunPipelineProvider";
import { useMemo } from "react";

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
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
}: EdgeProps) {
  const { status } = useRunPipelineEdge();
  const [edgePath] = getBezierPath({
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

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: "1.5",
        stroke: selected ? "#DE8411" : "#bdbdbc",
        ...statusStyles,
      }}
    />
  );
}
