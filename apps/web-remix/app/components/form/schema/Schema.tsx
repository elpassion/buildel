import { assert } from "~/utils/assert";
import type { JSONSchemaField } from "./SchemaParser";

export function Schema({
  schema,
  name,
  fields,
}: {
  schema: JSONSchemaField;
  name: string | null;
  fields: {
    string: React.FC<FieldProps>;
    number: React.FC<FieldProps>;
    array: React.FC<FieldProps>;
    boolean: React.FC<FieldProps>;
    editor: React.FC<FieldProps>;
    asyncSelect: React.FC<FieldProps>;
    asyncCreatableSelect: React.FC<FieldProps>;
  };
}) {
  assert(schema.type === "object");

  return <Field field={schema} name={name} schema={schema} fields={fields} />;
}

export function Field({ field, name, schema, fields }: FieldProps) {
  if (field.type === "string") {
    return (
      <fields.string
        field={field}
        name={name}
        schema={schema}
        fields={fields}
      />
    );
  }
  if (field.type === "number" || field.type === "integer") {
    return (
      <fields.number
        field={field}
        name={name}
        schema={schema}
        fields={fields}
      />
    );
  } else if (field.type === "object") {
    return Object.entries(field.properties).map(([propertyKey, value]) => {
      const fieldKey =
        name === null || name === "" ? propertyKey : `${name}.${propertyKey}`;

      return (
        <div key={fieldKey}>
          <Field
            field={value}
            name={fieldKey}
            schema={schema}
            fields={fields}
          />
        </div>
      );
    });
  } else if (field.type === "boolean") {
    return (
      <fields.boolean
        field={field}
        name={name}
        schema={schema}
        fields={fields}
      />
    );
  } else if (field.type === "array") {
    return (
      <fields.array field={field} name={name} schema={schema} fields={fields} />
    );
  }
  console.warn("Unknown field type", field);
  return null;
}

export interface FieldProps {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
  fields: {
    string: React.FC<FieldProps>;
    number: React.FC<FieldProps>;
    array: React.FC<FieldProps>;
    boolean: React.FC<FieldProps>;
    editor: React.FC<FieldProps>;
    asyncSelect: React.FC<FieldProps>;
    asyncCreatableSelect: React.FC<FieldProps>;
  };
}
