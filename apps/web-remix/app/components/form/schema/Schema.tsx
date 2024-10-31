import { BaseSize } from '~/components/ui/ui.types';
import { assert } from '~/utils/assert';

import type { JSONSchemaField } from './SchemaParser';

export function Schema({
  schema,
  name,
  fields,
  disabled,
  shouldDisplay,
  size,
}: {
  disabled?: boolean;
  schema: JSONSchemaField;
  shouldDisplay?: (schema: JSONSchemaField) => boolean;
  name: string | null;
  size?: BaseSize;
  fields: {
    string: React.FC<FieldProps>;
    number: React.FC<FieldProps>;
    array: React.FC<FieldProps>;
    boolean: React.FC<FieldProps>;
    editor: React.FC<FieldProps>;
    asyncSelect: React.FC<FieldProps>;
    asyncCreatableSelect: React.FC<FieldProps>;
    section: React.FC<FieldProps>;
  };
}) {
  assert(schema.type === 'object');

  return (
    <Field
      field={schema}
      name={name}
      schema={schema}
      fields={fields}
      disabled={disabled}
      shouldDisplay={shouldDisplay}
      size={size}
    />
  );
}

export function Field({
  field,
  name,
  schema,
  fields,
  disabled,
  shouldDisplay,
  size,
}: FieldProps) {
  if (field.type === 'string') {
    return (
      <fields.string
        field={field}
        name={name}
        schema={schema}
        fields={fields}
        disabled={disabled}
        shouldDisplay={shouldDisplay}
        size={size}
      />
    );
  }
  if (field.type === 'number' || field.type === 'integer') {
    return (
      <fields.number
        field={field}
        name={name}
        schema={schema}
        fields={fields}
        disabled={disabled}
        shouldDisplay={shouldDisplay}
        size={size}
      />
    );
  } else if (field.type === 'object') {
    return Object.entries(field.properties).map(([propertyKey, value]) => {
      const fieldKey =
        name === null || name === '' ? propertyKey : `${name}.${propertyKey}`;

      return (
        <div key={fieldKey}>
          <Field
            field={value}
            name={fieldKey}
            schema={schema}
            fields={fields}
            disabled={disabled}
            shouldDisplay={shouldDisplay}
            size={size}
          />
        </div>
      );
    });
  } else if (field.type === 'boolean') {
    return (
      <fields.boolean
        field={field}
        name={name}
        schema={schema}
        fields={fields}
        disabled={disabled}
        shouldDisplay={shouldDisplay}
        size={size}
      />
    );
  } else if (field.type === 'array') {
    return (
      <fields.array
        field={field}
        name={name}
        schema={schema}
        fields={fields}
        disabled={disabled}
        shouldDisplay={shouldDisplay}
        size={size}
      />
    );
  } else if (field.type === 'section') {
    return (
      <fields.section
        field={{ ...field, type: 'object' }}
        schema={{ ...field, type: 'object' }}
        name={name}
        disabled={disabled}
        fields={fields}
        shouldDisplay={shouldDisplay}
        size={size}
      />
    );
  }
  console.warn('Unknown field type', field);
  return null;
}

export interface FieldProps {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
  disabled?: boolean;
  size?: BaseSize;
  shouldDisplay?: (schema: JSONSchemaField) => boolean;
  fields: {
    string: React.FC<FieldProps>;
    number: React.FC<FieldProps>;
    array: React.FC<FieldProps>;
    boolean: React.FC<FieldProps>;
    editor: React.FC<FieldProps>;
    asyncSelect: React.FC<FieldProps>;
    asyncCreatableSelect: React.FC<FieldProps>;
    section: React.FC<FieldProps>;
  };
}
