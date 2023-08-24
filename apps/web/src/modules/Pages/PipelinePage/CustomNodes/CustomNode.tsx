import { useCallback, useMemo } from 'react';
import { startCase } from 'lodash';
import { useForm } from 'react-hook-form';
import { Handle, Position } from 'reactflow';
import { z } from 'zod';
import { Badge, Icon, IconButton } from '@elpassion/taco';
import { getBlockHandles } from '~/modules/Pipelines/PipelineGraph';
import {
  BlockConfig,
  IBlockConfig,
  IHandle,
} from '~/modules/Pipelines/pipelines.types';
import { useRunPipelineNode } from '../RunPipelineProvider';

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
export function CustomNode({ data, onUpdate, onDelete }: CustomNodeProps) {
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: data,
  });
  const handles = useMemo(() => getBlockHandles(data), [data]);
  const inputs = useMemo(
    () => handles.filter((h) => h.type === 'target'),
    [handles],
  );
  const outputs = useMemo(
    () => handles.filter((h) => h.type === 'source'),
    [handles],
  );

  const handleDelete = useCallback(() => {
    onDelete?.(data);
  }, []);

  const handleEdit = useCallback(() => {
    onUpdate?.(data);
  }, [data]);

  const isEditable = useMemo(() => {
    try {
      const schemaObj = JSON.parse(data.block_type.schema);

      const propKeys = Object.keys(schemaObj.properties.opts.properties);

      return propKeys.length > 0 && !!onUpdate;
    } catch {
      return false;
    }
  }, [data]);

  const { events } = useRunPipelineNode(data.name);

  return (
    <section className="min-h-[100px] min-w-[250px] max-w-[350px] rounded border border-neutral-100 bg-white drop-shadow-sm">
      <header className="flex items-center justify-between bg-green-200 p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold capitalize text-neutral-800">
            {data.type}
          </h3>
          <Badge size="xs" text={data.name} />
        </div>

        <div className="flex gap-1">
          {isEditable && (
            <IconButton
              icon={<Icon iconName="settings" />}
              size="xs"
              variant="basic"
              className="!h-6 !w-6 !p-1"
              onClick={handleEdit}
            />
          )}

          {onDelete && (
            <IconButton
              icon={<Icon iconName="x" />}
              size="xs"
              variant="basic"
              className="!h-6 !w-6 !p-1"
              onClick={handleDelete}
            />
          )}
        </div>
      </header>

      <div className="nodrag p-2">
        <p>Node</p>
        {/*tmp - run and execute push on console*/}
        {events.length > 0 ? (
          <textarea
            value={events.reduce(
              (acc, curr) => acc + ' ' + curr.payload.message,
              '',
            )}
          />
        ) : null}
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

        {inputs.map((handle, index) => (
          <InputHandle key={handle.id} handle={handle} index={index} />
        ))}
        {outputs.map((handle, index) => (
          <OutputHandle key={handle.id} handle={handle} index={index} />
        ))}
      </div>
    </section>
  );
}

function InputHandle({ handle, index }: { handle: IHandle; index: number }) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case 'text':
        return '!rounded-none !bg-transparent !border-1 !border-black';
      case 'audio':
        return '!rounded-full !bg-transparent !border-1 !border-black';
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className={`absolute right-[102%] translate-y-[-80%] text-xxs`}
        style={{ top: (index + 1) * 30 }}
      >
        {startCase(handle.data.name.replace(/_input/g, ' '))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Left}
        style={{ top: (index + 1) * 30 }}
        id={handle.id}
        className={handleTypeClassName}
      />
    </>
  );
}

function OutputHandle({ handle, index }: { handle: IHandle; index: number }) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case 'text':
        return '!rounded-none !bg-black !border-1 !border-black';
      case 'audio':
        return '!rounded-full !bg-black !border-1 !border-black';
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className={`absolute left-[102%] translate-y-[-80%] text-xxs`}
        style={{ top: (index + 1) * 30 }}
      >
        {startCase(handle.data.name.replace(/_output/g, ' '))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Right}
        style={{ top: (index + 1) * 30 }}
        id={handle.id}
        data-name={handle.data.name}
        className={handleTypeClassName}
      />
    </>
  );
}
