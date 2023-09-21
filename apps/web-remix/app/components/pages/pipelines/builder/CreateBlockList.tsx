import { z } from "zod";
import { useReactFlow, useViewport } from "reactflow";
import React, { DragEvent, useCallback } from "react";
import startCase from "lodash.startcase";
import classNames from "classnames";
import { useRunPipeline } from "./RunPipelineProvider";
import { IBlockConfig, IBlockTypes } from "../pipeline.types";
import { Button } from "@elpassion/taco";
import { BlockType } from "~/components/pages/pipelines/contracts";
interface CreateBlockListProps {
  blockTypes: IBlockTypes;
  onCreate: (node: IBlockConfig) => void;
}

export const CreateBlockList: React.FC<CreateBlockListProps> = ({
  blockTypes,
  onCreate,
}) => {
  const reactFlowInstance = useReactFlow();
  const { status: runStatus } = useRunPipeline();

  const onDragStart = (event: DragEvent<HTMLLIElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onClickAdd = useCallback(
    (block: z.TypeOf<typeof BlockType>) => {
      const { x, y } = reactFlowInstance.getViewport();
      const position = reactFlowInstance.project({
        x: (x / 2) * Math.random(),
        y: (y / 2) * Math.random(),
      });
      //@ts-ignore
      onCreate({
        name: "",
        type: block.type,
        position,
        opts: {},
        inputs: [],
      });
    },
    [onCreate, reactFlowInstance]
  );

  return (
    <ul className="flex flex-col gap-2">
      {blockTypes.map((block) => (
        <li
          key={block.type}
          className={classNames(
            "group min-w-[150px] cursor-grab rounded-lg bg-neutral-800 py-2 pl-4 pr-2 text-white flex justify-between items-center",
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
          <Button
            className="opacity-0 group-hover:opacity-100"
            size="xs"
            onClick={() => onClickAdd(block)}
          >
            Add
          </Button>
        </li>
      ))}
    </ul>
  );
};
