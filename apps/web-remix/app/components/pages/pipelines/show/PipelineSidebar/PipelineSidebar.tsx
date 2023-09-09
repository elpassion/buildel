import { startCase } from "lodash";
import React, { DragEvent, useMemo } from "react";
import { useRunPipeline } from "../RunPipelineProvider";
import classNames from "classnames";
import { assert } from "../usePipelineRun";
import { IBlockTypes } from "../../list/contracts";

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
          "dndnode min-w-[150px] cursor-grab rounded bg-white p-2",
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
    <aside className="absolute bottom-6 right-4 top-20 flex flex-col gap-2 rounded bg-neutral-300 p-2">
      {draggableNodes}
    </aside>
  );
};
