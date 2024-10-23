import React, { useEffect, useMemo, useRef, useState } from 'react';
import startCase from 'lodash.startcase';

import { asyncSelectApi } from '~/api/AsyncSelectApi';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import type {
  JSONSchemaField,
  JSONSchemaObjectField,
  JSONSchemaSectionField,
} from '~/components/form/schema/SchemaParser';
import { isEditorField } from '~/components/form/schema/SchemaParser';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';

import { NodePromptInputs } from './NodePromptInputs';
import {
  NodeReadonlyBooleanValue,
  NodeReadonlyItemTextarea,
  NodeReadonlyItemTitle,
  NodeReadonlyItemValue,
  NodeReadonlyItemWrapper,
} from './NodeReadonly.components';

interface NodeReadonlyFieldsProps {
  schema?: JSONSchemaField;
  ctx: Record<string, unknown>;
  blockName: string;
}

type JSONSchemaFlattenedFields = Exclude<
  JSONSchemaField,
  JSONSchemaObjectField | JSONSchemaSectionField
>;

//@todo fixed JSONSchemaField typing in app
export const NodeReadonlyFields = ({
  schema,
  ctx,
  blockName,
}: NodeReadonlyFieldsProps) => {
  const flattenedProperties = useMemo(() => {
    if (
      schema &&
      'properties' in schema &&
      isObjectField(schema.properties.opts)
    ) {
      return flattenProperties(schema.properties.opts);
    }
    return {};
  }, [schema]);

  const flattenedCtx = useMemo(() => flattenObject(ctx), [ctx]);

  const renderProperties = useMemo(() => {
    return Object.keys(flattenedProperties).map((key) => {
      // only string/number/boolean types right now
      if (
        flattenedProperties[key].type !== 'string' &&
        flattenedProperties[key].type !== 'number' &&
        flattenedProperties[key].type !== 'boolean'
      ) {
        return null;
      }

      return (
        <li
          key={key}
          className={cn('pt-1 [&:not(:last-child)]:pb-3', {
            'basis-full [&:not(:first-child)]:border-t border-input':
              isEditorField(flattenedProperties[key]),
            hidden: !showValue(flattenedCtx[key]),
          })}
        >
          <NodeReadonlyItem
            properties={flattenedProperties[key]}
            blockName={blockName}
            ctx={flattenedCtx}
            id={key}
          />
        </li>
      );
    });
  }, [flattenedProperties, flattenedCtx]);

  return (
    <ul className="flex gap-x-4 flex-wrap max-w-[350px] w-full">
      {renderProperties}
    </ul>
  );
};

interface NodeReadonlyItemProps {
  properties: Record<string, any>;
  ctx: Record<string, any>;
  id: string;
  blockName: string;
}

function NodeReadonlyItem({
  properties,
  id,
  ctx,
  blockName,
}: NodeReadonlyItemProps) {
  if (
    properties.presentAs === 'async-creatable-select' ||
    properties.presentAs === 'async-select'
  ) {
    return (
      <NodeReadonlyAsyncItem
        url={properties.url}
        value={ctx[id]}
        label={id}
        context={ctx}
      />
    );
  }

  const isEditor = properties.presentAs === 'editor';

  if (isEditor) {
    return (
      <NodeReadonlyItemWrapper className="pt-1" show={showValue(ctx[id])}>
        <NodeReadonlyItemTitle className="mb-1">
          {startCase(id)}
        </NodeReadonlyItemTitle>

        <NodeReadonlyItemTextarea value={ctx[id]} />

        <NodePromptInputs
          template={ctx[id]}
          className="mt-1"
          blockName={blockName}
        />
      </NodeReadonlyItemWrapper>
    );
  }

  if (properties.type === 'boolean') {
    return (
      <NodeReadonlyItemWrapper show={showValue(ctx[id])}>
        <NodeReadonlyItemTitle>{startCase(id)}</NodeReadonlyItemTitle>
        <NodeReadonlyBooleanValue value={ctx[id]} />
      </NodeReadonlyItemWrapper>
    );
  }

  return (
    <NodeReadonlyItemWrapper show={showValue(ctx[id])}>
      <NodeReadonlyItemTitle>{startCase(id)}</NodeReadonlyItemTitle>
      <NodeReadonlyItemValue>{ctx[id]}</NodeReadonlyItemValue>
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
  const abortController = useRef<AbortController | null>(null);
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();

  const [finalValue, setFinalValue] = useState(value);

  const readyUrl = url
    .replace('{{organization_id}}', organizationId.toString())
    .replace('{{pipeline_id}}', pipelineId.toString())
    .replace(/{{([\w.]+)}}/g, (_fullMatch, key) => {
      const cleanedKey = (key as string).split('.').at(-1);

      const replacedValue = cleanedKey ? context[cleanedKey] : key;

      return replacedValue ?? cleanedKey;
    });

  const fetchOptions = async () => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      return await asyncSelectApi
        .getData(readyUrl, { signal: abortController.current.signal })
        .then((opts) => opts.map(toSelectOption));
    } finally {
      abortController.current = null;
    }
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

const isObjectField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaObjectField => {
  return (schema as JSONSchemaObjectField)?.type === 'object';
};

const isSectionField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaSectionField => {
  return (schema as JSONSchemaSectionField)?.type === 'section';
};

function showValue(value: unknown) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return true;
  }

  return !!value;
}

function flattenProperties(
  schema: JSONSchemaObjectField | JSONSchemaSectionField,
): Record<string, JSONSchemaFlattenedFields> {
  return Object.entries(schema.properties).reduce((acc, [key, value]) => {
    if (isObjectField(value) || isSectionField(value)) {
      return {
        ...acc,
        ...flattenProperties(value),
      };
    }

    if (!('readonly' in value) || value.readonly === false) return acc;

    return {
      ...acc,
      [key]: value,
    };
  }, {});
}

function flattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        ...acc,
        ...flattenObject(value as Record<string, unknown>),
      };
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {});
}
