import type { PropsWithChildren } from 'react';
import React, { useCallback, useMemo } from 'react';
import startCase from 'lodash.startcase';
import { AlertCircle } from 'lucide-react';

import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { NodePromptInputs } from '~/components/pages/pipelines/CustomNodes/NodePromptInputs';
import { NodeReadonlyFields } from '~/components/pages/pipelines/CustomNodes/NodeReadonlyFields';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/utils/cn';

import type { IBlockConfig } from '../pipeline.types';
import { getBlockFields, getBlockHandles } from '../PipelineFlow.utils';
import { useRunPipelineNode } from '../RunPipelineProvider';
import { NodeFieldsForm } from './NodeFieldsForm';
import { NodeFieldsOutput } from './NodeFieldsOutput';
import { InputHandle, OutputHandle, ToolHandle } from './NodeHandles';

export interface CustomNodeProps extends PropsWithChildren {
  data: IBlockConfig;
  selected: boolean;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete: (block: IBlockConfig) => void;
  isConnectable?: boolean;
  disabled?: boolean;
  className?: string;
}
export function CustomNode({
  data,
  selected,
  children,
  className,
}: CustomNodeProps) {
  const { status, isValid, errors } = useRunPipelineNode(data);

  const borderStyles = useCallback(() => {
    if (!isValid) return 'border-red-500';
    if (selected) return 'border-orange-500';
    return 'border-input';
  }, [isValid, selected]);

  return (
    <>
      <section
        aria-label={`Block: ${data.name}`}
        data-testid="builder-block"
        data-active={status}
        data-valid={isValid}
        className={cn(
          'min-h-[100px] min-w-[250px] max-w-[500px] break-words rounded-lg bg-white drop-shadow-sm transition border nowheel',
          borderStyles(),
          {
            'scale-110': status,
            'border-orange-500': status,
          },
          className,
        )}
      >
        <NodeWorkingIcon isWorking={status} />
        {children}
      </section>
      {errors.length === 0 ? null : (
        <p className="text-red-500 flex gap-1 items-center mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-xs">
            {errors.length === 1
              ? errors[0]
              : 'This block contains problems to fix.'}
          </span>
        </p>
      )}
    </>
  );
}

export interface CustomNodeHeaderProps extends PropsWithChildren {
  data: IBlockConfig;
}

export function CustomNodeHeader({ data, children }: CustomNodeHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex items-center justify-between py-2 px-3 rounded-t-lg gap-2',
        getNodeHeaderStyles(data.type),
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium capitalize">
          {startCase(data.type)}
        </h3>

        <Badge
          variant="secondary"
          className="px-2 py-0 text-xs font-normal text-foreground"
        >
          {data.name}
        </Badge>
      </div>

      {children}
    </header>
  );
}

function getNodeHeaderStyles(type: string) {
  switch (type) {
    case 'chat':
      return 'bg-blue-100 text-foreground';
    case 'audio_output':
    case 'audio_input':
      return 'bg-violet-100 text-foreground';
    case 'text_output':
    case 'text_input':
    case 'collect_all_text':
      return 'bg-zinc-200 text-foreground';
    case 'file_output':
    case 'file_input':
      return 'bg-slate-200 text-foreground';
    case 'document_search':
    case 'document_tool':
    case 'csv_search':
      return 'bg-teal-100 text-foreground';
    case 'api_call_tool':
    case 'webhook_output':
      return 'bg-sky-200 text-foreground';
    case 'timer':
    case 'date':
      return 'bg-purple-100 text-foreground';

    default:
      return 'bg-primary text-primary-foreground';
  }
}

interface CustomNodeBodyProps {
  data: IBlockConfig;
  isConnectable?: boolean;
  disabled?: boolean;
}
export function CustomNodeBody({
  data,
  isConnectable,
  disabled,
}: CustomNodeBodyProps) {
  const handles = useMemo(() => getBlockHandles(data), [data]);

  const inputsHandles = useMemo(
    () =>
      handles
        .filter((h) => h.data.type !== 'controller' && h.data.type !== 'worker')
        .filter((h) => h.type === 'target'),
    [handles],
  );
  const outputsHandles = useMemo(
    () =>
      handles
        .filter((h) => h.data.type !== 'controller' && h.data.type !== 'worker')
        .filter((h) => h.type === 'source'),
    [handles],
  );
  const ioHandles = useMemo(
    () =>
      handles.filter(
        (h) => h.data.type === 'controller' || h.data.type === 'worker',
      ),
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

  return (
    <div className="p-2 nodrag">
      <NodeReadonlyFields
        schema={data.block_type?.schema as JSONSchemaField}
        data={data.opts}
      />

      {inputsFields.length > 0 ? (
        <NodeFieldsForm
          block={data}
          fields={inputsFields}
          disabled={disabled}
        />
      ) : null}

      {outputFields.length > 0 ? (
        <NodeFieldsOutput fields={outputFields} block={data} />
      ) : null}

      {inputsHandles.map((handle, index) => (
        <InputHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}
      {outputsHandles.map((handle, index) => (
        <OutputHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}

      {ioHandles.map((handle, index) => (
        <ToolHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}

      {data.type === 'chat' && (
        <NodePromptInputs
          className="border-t border-input mt-1 pt-2"
          data={data}
        />
      )}
    </div>
  );
}

function NodeWorkingIcon({ isWorking }: { isWorking: boolean }) {
  return (
    <div
      className={cn(
        'animate-ping w-2 h-2 rounded-full bg-primary-500 flex justify-center items-center absolute z-10 -top-1 -right-1',
        {
          hidden: !isWorking,
          block: isWorking,
        },
      )}
    />
  );
}
