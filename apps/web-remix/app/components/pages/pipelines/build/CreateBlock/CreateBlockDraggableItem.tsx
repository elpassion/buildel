import type { DragEvent } from 'react';
import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import classNames from 'classnames';
import startCase from 'lodash.startcase';
import { Plus } from 'lucide-react';
import type { z } from 'zod';

import type { BlockType } from '~/api/blockType/blockType.contracts';
import { IconButton } from '~/components/iconButton';

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
        'w-full min-w-[100px] bg-white py-2 pl-3 pr-2 text-foreground flex justify-between items-center transition text-xs rounded-lg',
        {
          'opacity-70': runStatus !== 'idle',
          'cursor-grab hover:drop-shadow': runStatus === 'idle',
        },
      )}
      draggable={runStatus === 'idle'}
      onDragStart={(event) => {
        onDragStart(event, data);
      }}
    >
      <span>{startCase(data.type)}</span>
      <IconButton
        size="xxxs"
        variant="secondary"
        data-testid={`Add block: ${data.type}`}
        aria-label={`Add block: ${data.type}`}
        onClick={() => onClickAdd(data)}
        disabled={runStatus !== 'idle'}
        icon={<Plus />}
      />
    </div>
  );
};
