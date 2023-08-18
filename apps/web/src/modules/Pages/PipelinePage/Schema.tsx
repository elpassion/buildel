import { JSONSchemaField } from '~/modules/Pipelines/pipelines.hooks';

export function Schema({
  schema,
  name,
  fields,
}: {
  schema: string;
  name: string | null;
  fields: { string: React.FC<FieldProps>; number: React.FC<FieldProps> };
}) {
  const schemaObj = JSON.parse(schema);
  return (
    <Field field={schemaObj} name={name} schema={schemaObj} fields={fields} />
  );
}

function Field({
  field,
  name,
  schema,
  fields,
}: {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
  fields: { string: React.FC<FieldProps>; number: React.FC<FieldProps> };
}) {
  if (field.type === 'string') {
    return <fields.string field={field} name={name} schema={schema} />;
  } else if (field.type === 'number') {
    return <fields.number field={field} name={name} schema={schema} />;
  } else if (field.type === 'object') {
    return Object.entries(field.properties).map(([propertyKey, value]) => {
      const fieldKey = name === null ? propertyKey : `${name}.${propertyKey}`;
      return (
        <div key={name}>
          <Field
            field={value}
            name={fieldKey}
            schema={schema}
            fields={fields}
          />
        </div>
      );
    });
  } else if (field.type === 'array') {
    const fieldKey = name === null ? '0' : `${name}.0`;
    return (
      <div>
        {field.title} - {field.description}
        <Field
          field={field.items}
          name={fieldKey}
          schema={schema}
          fields={fields}
        />
      </div>
    );
  }
  console.warn('Unknown field type', field);
  return null;
}

export interface FieldProps {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
}
