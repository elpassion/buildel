import { useCallback, useMemo } from 'react';
import { startCase } from 'lodash';
import { Handle, Position } from 'reactflow';
import { Badge, Icon, IconButton } from '@elpassion/taco';
import {
  getBlockFields,
  getBlockHandles,
} from '~/modules/Pipelines/PipelineGraph';
import {
  IBlockConfig,
  IField,
  IHandle,
} from '~/modules/Pipelines/pipelines.types';
import { IEvent, useRunPipelineNode } from '../RunPipelineProvider';

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
export function CustomNode({ data, onUpdate, onDelete }: CustomNodeProps) {
  const handles = useMemo(() => getBlockHandles(data), [data]);
  const inputsHandles = useMemo(
    () => handles.filter((h) => h.type === 'target'),
    [handles],
  );
  const outputsHandles = useMemo(
    () => handles.filter((h) => h.type === 'source'),
    [handles],
  );

  const fields = useMemo(() => getBlockFields(data), [data]);
  const inputsFields = useMemo(
    () => fields.filter((field) => field.type === 'input'),
    [fields],
  );
  const outputFields = useMemo(
    () => fields.filter((field) => field.type === 'output'),
    [fields],
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

  return (
    <section className="min-h-[100px] min-w-[250px] max-w-[300px] break-words rounded border border-neutral-100 bg-white drop-shadow-sm">
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
        {inputsFields.length > 0 ? (
          <NodeFieldsForm blockName={data.name} fields={inputsFields} />
        ) : null}

        {outputFields.length > 0 ? (
          <NodeFieldsOutput fields={outputFields} blockName={data.name} />
        ) : null}

        {inputsHandles.map((handle, index) => (
          <InputHandle key={handle.id} handle={handle} index={index} />
        ))}
        {outputsHandles.map((handle, index) => (
          <OutputHandle key={handle.id} handle={handle} index={index} />
        ))}
      </div>
    </section>
  );
}

interface NodeFieldsProps {
  fields: IField[];
  blockName: string;
}

function NodeFieldsForm({ fields, blockName }: NodeFieldsProps) {
  const { push } = useRunPipelineNode(blockName);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};
      // @ts-ignore
      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }

      Object.keys(fieldsData).forEach((key) => {
        push(`${blockName}:${key}`, fieldsData[key]);
      });
    },
    [blockName, push],
  );

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        //todo handle types different than input
        <input type={field.data.type} name={field.data.name} />
      ))}
      <button type="submit">Send</button>
    </form>
  );
}

function NodeFieldsOutput({ fields, blockName }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(blockName);

  return (
    <div>
      {fields.map((field) => (
        <p key={field.data.name}>{getOutputValue(events, field.data.name)}</p>
      ))}
    </div>
  );
}

const getOutputValue = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  if (fieldEvents.length <= 0) return '';

  return fieldEvents[fieldEvents.length - 1].payload.message;
};

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
