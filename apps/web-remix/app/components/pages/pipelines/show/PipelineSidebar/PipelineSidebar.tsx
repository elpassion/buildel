import { startCase } from "lodash";
import React, { DragEvent, useMemo } from "react";
import { useRunPipeline } from "../RunPipelineProvider";
import classNames from "classnames";
import { IBlockTypes } from "../../list/contracts";
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
          "min-w-[150px] cursor-grab rounded bg-white p-2",
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
    <aside className="absolute bottom-8 right-8 top-24 flex flex-col gap-2 rounded bg-neutral-300 p-2">
      {draggableNodes}
    </aside>
  );
};
