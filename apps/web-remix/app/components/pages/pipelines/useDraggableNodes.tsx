import type { DragEvent, RefObject } from 'react';
import { useCallback, useState } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import type { z } from 'zod';

import type { BlockType } from '~/api/blockType/blockType.contracts';
import { assert } from '~/utils/assert';

import type { IBlockConfig, IEdge, INode } from './pipeline.types';

interface IUseDraggableNodes {
  wrapper: RefObject<HTMLDivElement>;
  onDrop: (node: IBlockConfig) => void;
}
export function useDraggableNodes({ wrapper, onDrop }: IUseDraggableNodes) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    INode,
    IEdge
  > | null>(null);

  const handleOnDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleOnDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      try {
        event.preventDefault();

        assert(wrapper.current);
        assert(reactFlowInstance);

        const reactFlowBounds = wrapper.current.getBoundingClientRect();

        const block = JSON.parse(
          event.dataTransfer.getData('application/reactflow'),
        ) as z.TypeOf<typeof BlockType>;

        if (!block) return;

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        onDrop({
          name: '',
          opts: {},
          block_type: block,
          type: block.type,
          inputs: [],
          position: position,
          connections: [],
        });
      } catch (err) {
        console.error(err);
      }
    },
    [onDrop, reactFlowInstance, wrapper],
  );

  const onInit = useCallback((inst: ReactFlowInstance<INode, IEdge>) => {
    setReactFlowInstance(inst);
  }, []);

  return {
    onInit,
    instance: reactFlowInstance,
    onDrop: handleOnDrop,
    onDragOver: handleOnDragOver,
  };
}
