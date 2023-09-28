import { DragEvent, RefObject, useCallback, useState } from "react";
import { ReactFlowInstance } from "reactflow";
import { IBlockConfig } from "../pipeline.types";
import { assert } from "ts-utils";
import { z } from "zod";
import { BlockType } from "~/components/pages/pipelines/contracts";

interface IUseDraggableNodes {
  wrapper: RefObject<HTMLDivElement>;
  onDrop: (node: IBlockConfig) => void;
}
export function useDraggableNodes({ wrapper, onDrop }: IUseDraggableNodes) {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const handleOnDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleOnDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      try {
        event.preventDefault();

        assert(wrapper.current);
        assert(reactFlowInstance);

        const reactFlowBounds = wrapper.current.getBoundingClientRect();

        const block = JSON.parse(
          event.dataTransfer.getData("application/reactflow")
        ) as z.TypeOf<typeof BlockType>;

        if (!block) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        onDrop({
          name: "",
          opts: {},
          block_type: block,
          ...block,
          inputs: [],
          position: position,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [onDrop, reactFlowInstance, wrapper]
  );

  const onInit = useCallback((inst: ReactFlowInstance) => {
    setReactFlowInstance(inst);
  }, []);

  return {
    onInit,
    instance: reactFlowInstance,
    onDrop: handleOnDrop,
    onDragOver: handleOnDragOver,
  };
}
