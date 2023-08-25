import { startCase } from 'lodash';
import React, { DragEvent, useMemo } from 'react';
import { useBlockTypes } from '~/modules/Pipelines';
import { assert } from '~/utils/assert';
import { useRunPipeline } from '../RunPipelineProvider';
import classNames from 'classnames';

export const PipelineSidebar: React.FC = () => {
  const { status: runStatus } = useRunPipeline();
  const { data: blockTypes } = useBlockTypes();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  assert(blockTypes);

  const draggableNodes = useMemo(() => {
    return Object.keys(blockTypes).map((key) => (
      <div
        key={key}
        className={classNames(
          'dndnode min-w-[150px] cursor-grab rounded bg-white p-2',
          {
            'opacity-50': runStatus !== 'idle',
          },
        )}
        onDragStart={(event) => {
          if (runStatus !== 'idle') return;
          onDragStart(event, blockTypes[key].type);
        }}
        draggable
      >
        <span>{startCase(blockTypes[key].type)}</span>
      </div>
    ));
  }, [blockTypes, runStatus]);

  return (
    <aside className="absolute bottom-3 right-3 top-14 flex flex-col gap-2 rounded bg-neutral-300 p-2">
      {draggableNodes}
    </aside>
  );
};
