import React, { DragEvent, useCallback } from "react";
import classNames from "classnames";
import startCase from "lodash.startcase";
import { useReactFlow } from "reactflow";
import { z } from "zod";
import { Icon, IconButton } from "@elpassion/taco";
import { BlockType } from "../../contracts";
import { useRunPipeline } from "../../RunPipelineProvider";
import { IBlockConfig, IBlockType } from "../../pipeline.types";

interface CreateBlockDraggableItemProps {
  onCreate: (node: IBlockConfig) => void;
  data: IBlockType;
}

export const CreateBlockDraggableItem: React.FC<
  CreateBlockDraggableItemProps
> = ({ onCreate, data }) => {
  const reactFlowInstance = useReactFlow();
  const { status: runStatus } = useRunPipeline();
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    block: z.TypeOf<typeof BlockType>
  ) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(block));
    event.dataTransfer.effectAllowed = "move";
  };

  const onClickAdd = useCallback(
    (block: z.TypeOf<typeof BlockType>) => {
      const { x, y } = reactFlowInstance.getViewport();
      const position = reactFlowInstance.project({
        x: (x / 2) * Math.random(),
        y: (y / 2) * Math.random(),
      });

      onCreate({
        name: "",
        opts: {},
        inputs: [],
        type: block.type,
        block_type: block,
        position: position,
        connections: [],
      });
    },
    [onCreate, reactFlowInstance]
  );

  return (
    <div
      key={data.type}
      className={classNames(
        "min-w-[100px] bg-neutral-850 py-2 pl-3 pr-2 text-white flex justify-between items-center transition text-xs",
        {
          "opacity-70": runStatus !== "idle",
          "cursor-grab hover:bg-neutral-950 hover:drop-shadow-md":
            runStatus === "idle",
        }
      )}
      draggable={runStatus === "idle"}
      onDragStart={(event) => {
        onDragStart(event, data);
      }}
    >
      <span>{startCase(data.type)}</span>
      <IconButton
        size="xs"
        aria-label="Add block"
        className="!w-5 !h-5 !rounded"
        onClick={() => onClickAdd(data)}
        icon={<Icon iconName="plus" />}
        disabled={runStatus !== "idle"}
      />
    </div>
  );
};
