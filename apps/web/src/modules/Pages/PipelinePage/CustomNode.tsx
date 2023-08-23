import { useCallback, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Handle, Position } from 'reactflow';
import { z } from 'zod';
import { Badge, Icon, IconButton } from '@elpassion/taco';
import {
  ArrayField,
  NumberField,
  StringField,
} from '~/modules/Pages/PipelinePage/SchemaFormFields';
import { getBlockHandles } from '~/modules/Pipelines/PipelineGraph';
import { BlockConfig, IBlockConfig } from '~/modules/Pipelines/pipelines.types';
import { Schema } from './Schema';
export interface CustomNodeProps {
  data: IBlockConfig;
}
export function CustomNode({ data }: CustomNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handles = useMemo(() => getBlockHandles(data), [data]);

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

  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: data,
  });

  return (
    <section
      ref={ref}
      className="min-h-[100px] min-w-[250px] rounded border border-neutral-100 bg-white drop-shadow-sm"
    >
      <header className="flex items-center justify-between bg-green-200 p-2">
        <div className="flex gap-2">
          <h3 className="font-bold capitalize text-neutral-800">
            {data.type.split('_')[1]}
          </h3>
          <Badge size="xs" text={data.name} />
        </div>

        <IconButton
          icon={<Icon iconName="x" />}
          size="xs"
          variant="basic"
          className="!h-6 !w-6 !p-1"
          onClick={handleDelete}
        />
      </header>

      <div className="nodrag p-2">
        <FormProvider {...methods}>
          <Schema
            schema={data.block_type.schema}
            name={null}
            fields={{
              string: StringField,
              number: NumberField,
              array: ArrayField,
            }}
          />
        </FormProvider>

        {handles.map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.type === 'source' ? Position.Right : Position.Left}
            id={handle.id}
          />
        ))}
      </div>
    </section>
  );
}
