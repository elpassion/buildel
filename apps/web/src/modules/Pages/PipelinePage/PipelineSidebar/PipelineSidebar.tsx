import React, { useMemo } from 'react';
import { useBlockTypes } from '~/modules/Pipelines';
import { assert } from '~/utils/assert';
interface PipelineSidebarProps {}

export const PipelineSidebar: React.FC<PipelineSidebarProps> = () => {
  const { data: blockTypes } = useBlockTypes();
  const onDragStart = (event: any, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const draggableNodes = useMemo(() => {
    assert(blockTypes);

    return Object.keys(blockTypes).map((key) => (
      <div
        key={key}
        className="dndnode min-w-[150px] cursor-grab rounded bg-white p-2"
        onDragStart={(event) => onDragStart(event, blockTypes[key].type)}
        draggable
      >
        <span>{blockTypes[key].type}</span>
      </div>
    ));
  }, [blockTypes]);

  if (!blockTypes) return;

  return (
    <footer className="absolute bottom-3 right-3 top-14 flex flex-col gap-2 rounded bg-neutral-300 p-2">
      {draggableNodes}
    </footer>
  );
};
