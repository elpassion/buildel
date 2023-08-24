import { useCallback, useMemo } from 'react';
import { Badge, Icon, IconButton } from '@elpassion/taco';
import {
  getBlockFields,
  getBlockHandles,
} from '~/modules/Pipelines/PipelineGraph';
import { IBlockConfig } from '~/modules/Pipelines/pipelines.types';
import { NodeFieldsForm, NodeFieldsOutput } from './NodeFields';
import { InputHandle, OutputHandle } from './NodeHandles';

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
    <section className="min-h-[100px] min-w-[250px] max-w-[350px] break-words rounded border border-neutral-100 bg-white drop-shadow-sm">
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
