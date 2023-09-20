import startCase from "lodash.startcase";
import React, { DragEvent, useMemo } from "react";
import { useRunPipeline } from "./RunPipelineProvider";
import classNames from "classnames";
import { IBlockTypes } from "../pipeline.types";
import { assert } from "~/utils/assert";

interface PipelineSidebarProps {
  blockTypes: IBlockTypes;
}
export const PipelineSidebar: React.FC<PipelineSidebarProps> = ({
  blockTypes,
}) => {
  const { status: runStatus } = useRunPipeline();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  assert(blockTypes);

  const draggableNodes = useMemo(() => {
    return blockTypes.map((block) => (
      <div
        key={block.type}
        className={classNames(
          "min-w-[150px] cursor-grab rounded bg-neutral-800 hover:bg-neutral-700 p-2 text-neutral-100",
          {
            "opacity-50": runStatus !== "idle",
          }
        )}
        onDragStart={(event) => {
          if (runStatus !== "idle") return;
          onDragStart(event, block.type);
        }}
        draggable
      >
        <span>{startCase(block.type)}</span>
      </div>
    ));
  }, [blockTypes, runStatus]);

  return (
    <aside className="absolute bottom-12 right-4 top-24 flex flex-col gap-1 rounded-xl bg-neutral-850 p-2">
      {draggableNodes}
    </aside>
  );
};
