import { z } from 'zod';
import { zfd } from 'zod-form-data';

export function generateZODSchema(
  schema: JSONSchemaField,
  isOptional = false,
  context: Record<string, string> = {},
): z.ZodSchema<unknown> {
  if (schema.type === 'string') {
    if ('enum' in schema) {
      let nestedSchema = z.enum(schema.enum as any);

      if (isOptional) {
        //@ts-ignore
        nestedSchema = nestedSchema.optional();
      }
      if ('default' in schema && schema.default !== undefined) {
        //@ts-ignore
        nestedSchema = nestedSchema.default(schema.default);
      }

      return nestedSchema;
    }

    let nestedSchema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();

    if ('regex' in schema && schema.regex !== undefined) {
      nestedSchema = nestedSchema.regex(
        new RegExp(schema?.regex?.pattern, 'i'),
        schema?.regex?.errorMessage,
      );
    }

    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }
    if (
      'default' in schema &&
      schema.default !== undefined &&
      schema.default !== null
    ) {
      let defaultValue = schema.default;
      Object.entries(context).forEach(([key, value]) => {
        defaultValue = defaultValue.replace(`{{${key}}}`, value);
      });
      // @ts-ignore
      nestedSchema = nestedSchema.default(defaultValue);
    }

    if (
      'minLength' in schema &&
      schema.minLength !== undefined &&
      'min' in nestedSchema
    ) {
      nestedSchema = nestedSchema?.min(
        schema.minLength,
        schema.errorMessages?.minLength,
      );
    }
    if (
      'maxLength' in schema &&
      schema.maxLength !== undefined &&
      'max' in nestedSchema
    ) {
      nestedSchema = nestedSchema.max(schema.maxLength);
    }

    if ('presentAs' in schema && schema.presentAs === 'editor') {
      return nestedSchema;
    }

    if ('presentAs' in schema && schema.presentAs === 'async-select') {
      return nestedSchema;
    }

    if (
      'presentAs' in schema &&
      schema.presentAs === 'async-creatable-select'
    ) {
      return nestedSchema;
    }

    return nestedSchema;
  }

  if (schema.type === 'number') {
    let nestedSchema: z.ZodNumber | z.ZodOptional<z.ZodNumber> = z.number();

    if (schema.minimum !== undefined) {
      nestedSchema = nestedSchema.min(schema.minimum);
    }
    if (schema.maximum !== undefined) {
      nestedSchema = nestedSchema.max(schema.maximum);
    }
    if (schema.step !== undefined) {
      nestedSchema = nestedSchema.multipleOf(schema.step);
    }
    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }
    if ('default' in schema && schema.default !== undefined) {
      // @ts-ignore
      nestedSchema = nestedSchema.default(schema.default);
    }
    return zfd.numeric(nestedSchema);
  }

  if (schema.type === 'array') {
    let nestedSchema:
      | z.ZodArray<z.ZodTypeAny>
      | z.ZodOptional<z.ZodArray<z.ZodTypeAny>> = z.array(
      generateZODSchema(schema.items, false, context) as z.ZodTypeAny,
    );

    if (schema.minItems !== undefined) {
      nestedSchema = nestedSchema.min(schema.minItems);
    }

    if ('default' in schema && schema.default !== undefined) {
      // @ts-ignore
      nestedSchema = nestedSchema.default(schema.default);
    }

    if (isOptional) {
      // @ts-ignore
      nestedSchema = nestedSchema.optional();
    }

    return zfd.json(nestedSchema);
  }

  if (schema.type === 'object' || schema.type === 'section') {
    const propertySchemas: z.ZodRawShape = Object.entries(
      schema.properties,
    ).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: generateZODSchema(
          value,
          !(schema.required || []).includes(key) || isOptional,
          context,
        ),
      };
    }, {});

    let nestedSchema: z.ZodSchema | z.ZodOptional<z.ZodSchema> =
      z.object(propertySchemas);

    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }

    return nestedSchema;
  }

  if (schema.type === 'boolean') {
    let nestedSchema = z.union([
      z.boolean(),
      z.string().transform((val) => val === 'on'),
    ]);

    if (isOptional) {
      // @ts-ignore
      nestedSchema = nestedSchema.optional();
    }
    if ('default' in schema && schema.default !== undefined) {
      // @ts-ignore
      nestedSchema = nestedSchema.default(schema.default);
    }

    return nestedSchema;
  }

  return z.any();
}

export type JSONSchemaObjectField = {
  title?: string;
  type: 'object';
  properties: { [key: string]: JSONSchemaField };
  required?: string[];
};

export type JSONSchemaSectionField = {
  title?: string;
  type: 'section';
  properties: { [key: string]: JSONSchemaField };
  required?: string[];
};

export type JSONSchemaStringField = {
  type: 'string';
  title: string;
  description: string;
  descriptionWhen?: Record<string, Record<string, string>>;
  minLength?: number;
  maxLength?: number;
  default?: string;
  pattern?: string;
  regex?: {
    pattern: string;
    errorMessage: string;
  };
  readonly?: boolean;
  defaultWhen?: Record<string, Record<string, string>>;
  displayWhen?: DisplayWhen;
  errorMessages?: Record<string, string>;
};

export type Condition = {
  min?: number;
};

export type DisplayWhen = {
  [key: string]: Condition | DisplayWhen;
};

export type JSONSchemaField =
  | JSONSchemaObjectField
  | JSONSchemaSectionField
  | JSONSchemaStringField
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      presentAs: 'password';
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'wysiwyg';
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'editor';
      editorLanguage: 'json' | 'custom';
      suggestions: { value: string; description: string; type: string }[];
      minLength?: number;
      maxLength?: number;
      default?: string;
      readonly?: boolean;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      enum: string[];
      enumPresentAs: 'checkbox' | 'radio';
      default?: string;
      readonly?: boolean;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'async-select';
      url: string;
      default?: string;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'async-creatable-select';
      url: string;
      default?: string;
      schema: JSONSchemaField;
      readonly?: boolean;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'number' | 'integer';
      title: string;
      description: string;
      minimum?: number;
      maximum?: number;
      step?: number;
      default?: number;
      readonly?: boolean;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'array';
      title: string;
      description: string;
      items: JSONSchemaField;
      minItems: number;
      default?: unknown[];
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    }
  | {
      type: 'boolean';
      title: string;
      description: string;
      default?: boolean;
      displayWhen?: DisplayWhen;
      errorMessages?: Record<string, string>;
    };

export const isObjectField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaObjectField => {
  return (schema as JSONSchemaObjectField)?.type === 'object';
};

export const isSectionField = (
  schema?: JSONSchemaField,
): schema is JSONSchemaSectionField => {
  return (schema as JSONSchemaSectionField)?.type === 'section';
};

export function checkDisplayWhenConditions(
  conditions: DisplayWhen,
  ctx: Record<string, any>,
): boolean {
  for (const key in conditions) {
    const condition = conditions[key];

    if (typeof condition === 'object' && !Array.isArray(condition)) {
      if (!checkDisplayWhenConditions(condition as DisplayWhen, ctx[key])) {
        return false;
      }
    } else {
      if (key === 'min') {
        if (ctx < condition) {
          return false;
        }
      }
    }
  }
  return true;
}

export function fillSchemaWithDefaults<T>(
  schema: JSONSchemaField,
  data: Record<string, any>,
  ctx: Record<string, string> = {},
): T {
  const validateSchema = generateZODSchema(schema, true, ctx);

  function parseNestedSchemaObjects(
    schema: JSONSchemaField,
    data: Record<string, any>,
  ): Record<string, any> {
    let parsedData = { ...data };

    if (isObjectField(schema) || isSectionField(schema)) {
      for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (isObjectField(propertySchema) || isSectionField(propertySchema)) {
          parsedData[key] = parseNestedSchemaObjects(
            propertySchema,
            parsedData[key] || {},
          );
        }
      }
      parsedData = generateZODSchema(schema, true, ctx).parse(
        parsedData,
      ) as Record<string, any>;
    }

    return parsedData;
  }

  return validateSchema.parse(parseNestedSchemaObjects(schema, data)) as T;
}

export function isEditorField(schema: JSONSchemaField): boolean {
  return 'presentAs' in schema && schema.presentAs === 'editor';
}
