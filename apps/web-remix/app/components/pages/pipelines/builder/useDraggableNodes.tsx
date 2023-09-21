import { DragEvent, RefObject, useCallback, useState } from "react";
import { ReactFlowInstance } from "reactflow";
import { IBlockConfig } from "../pipeline.types";
import { assert } from "~/utils/assert";

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
      event.preventDefault();

      assert(wrapper.current);
      assert(reactFlowInstance);

      const reactFlowBounds = wrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      console.log(position);
      //name is set higher
      const newNode = {
        name: "",
        type: type,
        position,
        opts: {},
        inputs: [],
      };

      // @ts-ignore
      onDrop(newNode);
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
