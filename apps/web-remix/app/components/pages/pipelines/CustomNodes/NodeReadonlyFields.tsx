import React, { useEffect, useMemo, useState } from 'react';
import startCase from 'lodash.startcase';

import { asyncSelectApi } from '~/api/AsyncSelectApi';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import type {
  JSONSchemaField,
  JSONSchemaObjectField,
} from '~/components/form/schema/SchemaParser';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';

interface NodeReadonlyFieldsProps {
  schema?: JSONSchemaField;
  data: Record<string, unknown>;
}

//@todo fixed JSONSchemaField typing in app
export const NodeReadonlyFields = ({
  schema,
  data,
}: NodeReadonlyFieldsProps) => {
  const properties = useMemo(() => {
    //@ts-ignore
    if (isObjectField(schema?.properties?.opts)) {
      //@ts-ignore
      const properties = (schema?.properties?.opts?.properties ??
        {}) as JSONSchemaObjectField;
      return Object.entries(properties).reduce(
        (acc, [key, value]) => {
          //@ts-ignore
          if (value?.readonly) return { ...acc, [key]: value };

          return acc;
        },
        {} as Record<string, any>,
      );
    }

    return {};
  }, [schema]);

  const renderProperties = useMemo(() => {
    return Object.keys(properties).map((key) => {
      // only string/number types right now
      if (
        properties[key].type !== 'string' &&
        properties[key].type !== 'number'
      ) {
        return null;
      }

      return (
        <li
          key={key}
          className={cn('py-1', {
            'basis-full': properties[key].presentAs === 'editor',
          })}
        >
          <NodeReadonlyItem properties={properties[key]} data={data} id={key} />
        </li>
      );
    });
  }, [properties]);

  return (
    <ul className="flex gap-x-4 flex-wrap max-w-[250px] w-fit">
      {renderProperties}
    </ul>
  );
};

interface NodeReadonlyItemProps {
  properties: Record<string, any>;
  data: Record<string, any>;
  id: string;
}

function NodeReadonlyItem({ properties, id, data }: NodeReadonlyItemProps) {
  if (
    properties.presentAs === 'async-creatable-select' ||
    properties.presentAs === 'async-select'
  ) {
    return (
      <NodeReadonlyAsyncItem
        url={properties.url}
        value={data[id]}
        label={id}
        context={data}
      />
    );
  }
  const isEditor = properties.presentAs === 'editor';
  return (
    <NodeReadonlyItemWrapper
      className={cn({
        'border-t border-input pt-2': isEditor,
      })}
      show={!!data[id]}
    >
      <NodeReadonlyItemTitle>{startCase(id)}</NodeReadonlyItemTitle>
      <NodeReadonlyItemValue className={cn({ 'line-clamp-2': isEditor })}>
        {data[id]}
      </NodeReadonlyItemValue>
    </NodeReadonlyItemWrapper>
  );
}

interface NodeReadonlyAsyncItemProps {
  url: string;
  value: string;
  context: Record<string, any>;
  label: string;
}

function NodeReadonlyAsyncItem({
  url,
  value,
  context,
  label,
}: NodeReadonlyAsyncItemProps) {
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();

  const [finalValue, setFinalValue] = useState(value);

  const readyUrl = url
    .replace('{{organization_id}}', organizationId.toString())
    .replace('{{pipeline_id}}', pipelineId.toString())
    .replace(/{{([\w.]+)}}/g, (_fullMatch, key) => {
      const cleanedKey = key.replace(/^[^.]+\./, '');

      const replacedValue = context[cleanedKey];

      return replacedValue ?? cleanedKey;
    });

  const fetchOptions = async () => {
    return asyncSelectApi
      .getData(readyUrl)
      .then((opts) => opts.map(toSelectOption));
  };

  useEffect(() => {
    fetchOptions().then((options) => {
      setFinalValue(
        options.find((option) => option.value === value)?.label ?? value,
      );
    });
  }, [url, value]);

  return (
    <NodeReadonlyItemWrapper show={!!finalValue}>
      <NodeReadonlyItemTitle>{startCase(label)}</NodeReadonlyItemTitle>
      <NodeReadonlyItemValue>{finalValue}</NodeReadonlyItemValue>
    </NodeReadonlyItemWrapper>
  );
}

function NodeReadonlyItemWrapper({
  className,
  children,
  show,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { show?: boolean }) {
  if (!show) return;
  return (
    <div className={cn('flex flex-col', className)} {...rest}>
      {children}
    </div>
  );
}

function NodeReadonlyItemTitle({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-xs text-muted-foreground', className)} {...rest}>
      {children}
    </span>
  );
}

function NodeReadonlyItemValue({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-sm text-foreground line-clamp-1 break-all',
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

const isObjectField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaObjectField => {
  return (schema as JSONSchemaObjectField)?.type === 'object';
};
