import { z } from "zod";
import { zfd } from "zod-form-data";

export function generateZODSchema(
  schema: JSONSchemaField,
  isOptional = false
): z.ZodSchema<unknown> {
  if (schema.type === "string") {
    if ("enum" in schema) {
      const nestedSchema = z.enum(schema.enum as any);
      return isOptional ? nestedSchema.optional() : nestedSchema;
    }

    let nestedSchema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();

    if ("presentAs" in schema && schema.presentAs === "editor") {
      return nestedSchema;
    }

    if ("presentAs" in schema && schema.presentAs === "async-select") {
      return nestedSchema;
    }

    if (schema.minLength !== undefined) {
      nestedSchema = nestedSchema.min(schema.minLength);
    }
    if (schema.maxLength !== undefined) {
      nestedSchema = nestedSchema.max(schema.maxLength);
    }
    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }
    return nestedSchema;
  }

  if (schema.type === "number") {
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
    return zfd.numeric(nestedSchema);
  }

  if (schema.type === "array") {
    let nestedSchema:
      | z.ZodArray<z.ZodTypeAny>
      | z.ZodOptional<z.ZodArray<z.ZodTypeAny>> = z.array(
      generateZODSchema(schema.items) as z.ZodTypeAny
    );

    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }

    return zfd.json(nestedSchema);
  }

  if (schema.type === "object") {
    const propertySchemas: z.ZodRawShape = Object.entries(
      schema.properties
    ).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: generateZODSchema(value, !(schema.required || []).includes(key)),
      };
    }, {});
    let nestedSchema: z.ZodSchema | z.ZodOptional<z.ZodSchema> =
      z.object(propertySchemas);
    return nestedSchema;
  }

  return z.any();
}

export type JSONSchemaField =
  | {
      type: "object";
      properties: { [key: string]: JSONSchemaField };
      required?: string[];
    }
  | {
      type: "string";
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      default?: string;
    }
  | {
      type: "string";
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      presentAs: "password";
    }
  | {
      type: "string";
      title: string;
      description: string;
      presentAs: "editor";
    }
  | {
      type: "string";
      title: string;
      description: string;
      minLength?: number;
      maxLength?: number;
      enum: string[];
      enumPresentAs: "checkbox" | "radio";
      default?: string;
    }
  | {
      type: "string";
      title: string;
      description: string;
      presentAs: "async-select";
      url: string;
      default?: string;
    }
  | {
      type: "number" | "integer";
      title: string;
      description: string;
      minimum?: number;
      maximum?: number;
      step?: number;
      default?: number;
    }
  | {
      type: "array";
      title: string;
      description: string;
      items: JSONSchemaField;
    }
  | {
      type: "boolean";
      title: string;
      description: string;
      default?: boolean;
    };
