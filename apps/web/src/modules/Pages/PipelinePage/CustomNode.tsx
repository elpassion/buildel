import { useCallback, useRef } from 'react';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { Handle, Position } from 'reactflow';
import { IconButton } from '@elpassion/taco';
import { Schema } from '~/modules/Pages';
import {
  ArrayField,
  NumberField,
  StringField,
} from '~/modules/Pages/PipelinePage/SchemaFormFields';
import { IBlockConfig } from '~/modules/Pipelines/pipelines.types';

export interface CustomNodeProps {
  data: IBlockConfig;
}
export function CustomNode({ data }: CustomNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  //Trigger onDelete cb on ReactFlow
  const handleDelete = useCallback(() => {
    if (!ref.current) return;

    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Backspace',
      code: 'Backspace',
    });

    ref.current.dispatchEvent(event);
  }, []);

  return (
    <section
      ref={ref}
      className="min-h-[100px] min-w-[250px] rounded border border-neutral-100 bg-white drop-shadow-sm"
    >
      <header className="flex justify-between bg-green-200 p-2">
        <h3>{data.name}</h3>

        <IconButton
          icon={<CloseIcon />}
          size="xs"
          variant="filled"
          className="!h-6 !w-6 !p-1"
          onClick={handleDelete}
        />
      </header>

      <div className="p-2">
        <Handle type="target" position={Position.Top} />

        <Schema
          schema={data.block_type.schema}
          name={null}
          fields={{
            string: StringField,
            number: NumberField,
            array: ArrayField,
          }}
        />

        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    </section>
  );
}
