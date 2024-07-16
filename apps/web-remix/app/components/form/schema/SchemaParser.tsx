import { z } from 'zod';
import { zfd } from 'zod-form-data';

export function generateZODSchema(
  schema: JSONSchemaField,
  isOptional = false,
  context: Record<string, string> = {},
): z.ZodSchema<unknown> {
  if (schema.type === 'string') {
    if ('enum' in schema) {
      const nestedSchema = z.enum(schema.enum as any);
      return isOptional ? nestedSchema.optional() : nestedSchema;
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
      nestedSchema = nestedSchema?.min(schema.minLength);
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

  if (schema.type === 'object') {
    const propertySchemas: z.ZodRawShape = Object.entries(
      schema.properties,
    ).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: generateZODSchema(
          value,
          !(schema.required || []).includes(key),
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
    let nestedSchema = z.union([z.boolean(), z.string()]);

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

export type JSONSchemaField =
  | {
      type: 'object';
      properties: { [key: string]: JSONSchemaField };
      required?: string[];
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      default?: string;
      regex?: {
        pattern: string;
        errorMessage: string;
      };
      defaultWhen?: Record<string, Record<string, string>>;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      presentAs: 'password';
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
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'async-select';
      url: string;
      default?: string;
    }
  | {
      type: 'string';
      title: string;
      description: string;
      presentAs: 'async-creatable-select';
      url: string;
      default?: string;
      schema: JSONSchemaField;
    }
  | {
      type: 'number' | 'integer';
      title: string;
      description: string;
      minimum?: number;
      maximum?: number;
      step?: number;
      default?: number;
    }
  | {
      type: 'array';
      title: string;
      description: string;
      items: JSONSchemaField;
      minItems: number;
      default?: unknown[];
    }
  | {
      type: 'boolean';
      title: string;
      description: string;
      default?: boolean;
    };
