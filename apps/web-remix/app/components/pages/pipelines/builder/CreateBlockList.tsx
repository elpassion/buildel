import React, { DragEvent } from "react";
import startCase from "lodash.startcase";
import classNames from "classnames";
import { useRunPipeline } from "./RunPipelineProvider";
import { IBlockTypes } from "../pipeline.types";
interface CreateBlockListProps {
  blockTypes: IBlockTypes;
}

export const CreateBlockList: React.FC<CreateBlockListProps> = ({
  blockTypes,
}) => {
  const { status: runStatus } = useRunPipeline();

  const onDragStart = (event: DragEvent<HTMLLIElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <ul className="flex flex-col gap-1">
      {blockTypes.map((block) => (
        <li
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
        </li>
      ))}
    </ul>
  );
};
