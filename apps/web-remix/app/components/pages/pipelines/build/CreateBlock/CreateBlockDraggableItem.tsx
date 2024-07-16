import type { DragEvent } from 'react';
import React, { useCallback } from 'react';
import { Icon, IconButton } from '@elpassion/taco';
import { useReactFlow } from '@xyflow/react';
import classNames from 'classnames';
import startCase from 'lodash.startcase';
import type { z } from 'zod';

import type { BlockType } from '~/api/blockType/blockType.contracts';

import type { IBlockConfig, IBlockType } from '../../pipeline.types';
import { useRunPipeline } from '../../RunPipelineProvider';

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
    block: z.TypeOf<typeof BlockType>,
  ) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClickAdd = useCallback(
    (block: z.TypeOf<typeof BlockType>) => {
      const { x, y } = reactFlowInstance.getViewport();
      const position = reactFlowInstance.screenToFlowPosition({
        x: (x / 2) * Math.random(),
        y: (y / 2) * Math.random(),
      });

      onCreate({
        name: '',
        opts: {},
        inputs: [],
        type: block.type,
        block_type: block,
        position: position,
        connections: [],
      });
    },
    [onCreate, reactFlowInstance],
  );

  return (
    <div
      id="draggable-block-item"
      key={data.type}
      className={classNames(
        'min-w-[100px] bg-neutral-850 py-2 pl-3 pr-2 text-white flex justify-between items-center transition text-xs',
        {
          'opacity-70': runStatus !== 'idle',
          'cursor-grab hover:bg-neutral-950 hover:drop-shadow-md':
            runStatus === 'idle',
        },
      )}
      draggable={runStatus === 'idle'}
      onDragStart={(event) => {
        onDragStart(event, data);
      }}
    >
      <span>{startCase(data.type)}</span>
      <IconButton
        size="xs"
        data-testid={`Add block: ${data.type}`}
        aria-label={`Add block: ${data.type}`}
        className="!w-5 !h-5 !rounded"
        onClick={() => onClickAdd(data)}
        icon={<Icon iconName="plus" />}
        disabled={runStatus !== 'idle'}
      />
    </div>
  );
};
