import { useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Handle, Position } from 'reactflow';
import { z } from 'zod';
import { Badge, Icon, IconButton } from '@elpassion/taco';
import { getBlockHandles } from '~/modules/Pipelines/PipelineGraph';
import { BlockConfig, IBlockConfig } from '~/modules/Pipelines/pipelines.types';

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
export function CustomNode({ data, onUpdate, onDelete }: CustomNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handles = useMemo(() => getBlockHandles(data), [data]);

  const handleDelete = useCallback(() => {
    onDelete?.(data);
  }, []);

  const handleEdit = useCallback(() => {
    onUpdate?.(data);
  }, [data]);

  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: data,
  });

  return (
    <section
      ref={ref}
      className="min-h-[100px] min-w-[250px] max-w-[350px] rounded border border-neutral-100 bg-white drop-shadow-sm"
    >
      <header className="flex items-center justify-between bg-green-200 p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold capitalize text-neutral-800">
            {data.type}
          </h3>
          <Badge size="xs" text={data.name} />
        </div>

        <div className="flex gap-1">
          <IconButton
            icon={<Icon iconName="settings" />}
            size="xs"
            variant="basic"
            className="!h-6 !w-6 !p-1"
            onClick={handleEdit}
          />

          <IconButton
            icon={<Icon iconName="x" />}
            size="xs"
            variant="basic"
            className="!h-6 !w-6 !p-1"
            onClick={handleDelete}
          />
        </div>
      </header>

      <div className="nodrag p-2">
        <p>Node</p>
        {/*<FormProvider {...methods}>*/}
        {/*  <Schema*/}
        {/*    schema={data.block_type.schema}*/}
        {/*    name={null}*/}
        {/*    fields={{*/}
        {/*      string: StringField,*/}
        {/*      number: NumberField,*/}
        {/*      array: ArrayField,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</FormProvider>*/}

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
