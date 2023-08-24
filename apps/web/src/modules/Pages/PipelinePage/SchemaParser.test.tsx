import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { JSONSchemaField } from '~/modules/Pipelines/pipelines.types';

describe(generateZODSchema.name, () => {
  test('correctly parses string field', () => {
    const schema: JSONSchemaField = {
      type: 'string',
      title: 'test',
      description: 'test',
      minLength: 10,
      maxLength: 20,
    };
    const zodSchema = generateZODSchema(schema);
    expect(zodSchema.safeParse('12345678901')).toEqual({
      success: true,
      data: '12345678901',
    });
    expect(zodSchema.safeParse('test')).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "too_small",
          "minimum": 10,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 10 character(s)",
          "path": []
        }
      ]],
        "success": false,
      }
    `);
    expect(zodSchema.safeParse('1234567890112345678901'))
      .toMatchInlineSnapshot(`
        {
          "error": [ZodError: [
          {
            "code": "too_big",
            "maximum": 20,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "String must contain at most 20 character(s)",
            "path": []
          }
        ]],
          "success": false,
        }
      `);
  });

  test('correctly parses number field', () => {
    const schema: JSONSchemaField = {
      type: 'number',
      title: 'test',
      description: 'test',
      minimum: 1,
      maximum: 5,
    };
    const zodSchema = generateZODSchema(schema);
    expect(zodSchema.safeParse(2)).toEqual({
      success: true,
      data: 2,
    });
    expect(zodSchema.safeParse(-1)).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "number",
          "inclusive": true,
          "exact": false,
          "message": "Number must be greater than or equal to 1",
          "path": []
        }
      ]],
        "success": false,
      }
    `);
    expect(zodSchema.safeParse(2)).toMatchInlineSnapshot(`
      {
        "data": 2,
        "success": true,
      }
    `);
  });

  test('correctly parses array field', () => {
    const schema: JSONSchemaField = {
      type: 'array',
      title: 'test',
      description: 'test',
      items: {
        type: 'number',
        title: 'test',
        description: 'test',
        minimum: 1,
      },
    };
    const zodSchema = generateZODSchema(schema);
    expect(zodSchema.safeParse([2])).toEqual({
      success: true,
      data: [2],
    });
    expect(zodSchema.safeParse([''])).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "string",
          "path": [
            0
          ],
          "message": "Expected number, received string"
        }
      ]],
        "success": false,
      }
    `);
    expect(zodSchema.safeParse({})).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "array",
          "received": "object",
          "path": [],
          "message": "Expected array, received object"
        }
      ]],
        "success": false,
      }
    `);
  });

  test('correctly parses object field', () => {
    const schema: JSONSchemaField = {
      type: 'object',
      required: ['test'],
      properties: {
        test: {
          type: 'number',
          title: 'test',
          description: 'test',
          minimum: 1,
        },
        nonRequired: {
          type: 'number',
          title: 'test',
          description: 'test',
        },
      },
    };
    const zodSchema = generateZODSchema(schema);
    expect(zodSchema.safeParse({ test: 5 })).toEqual({
      success: true,
      data: { test: 5 },
    });
    expect(zodSchema.safeParse({})).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "undefined",
          "path": [
            "test"
          ],
          "message": "Required"
        }
      ]],
        "success": false,
      }
    `);
    expect(zodSchema.safeParse({ test: '' })).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "string",
          "path": [
            "test"
          ],
          "message": "Expected number, received string"
        }
      ]],
        "success": false,
      }
    `);
  });
});

function generateZODSchema(
  schema: JSONSchemaField,
  isOptional = false,
): z.ZodSchema<unknown> {
  if (schema.type === 'string') {
    let nestedSchema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();

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

  if (schema.type === 'number') {
    let nestedSchema: z.ZodNumber | z.ZodOptional<z.ZodNumber> = z.number();

    if (schema.minimum !== undefined) {
      nestedSchema = nestedSchema.min(schema.minimum);
    }
    if (schema.maximum !== undefined) {
      nestedSchema = nestedSchema.max(schema.maximum);
    }
    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }
    return nestedSchema;
  }

  if (schema.type === 'array') {
    let nestedSchema:
      | z.ZodArray<z.ZodTypeAny>
      | z.ZodOptional<z.ZodArray<z.ZodTypeAny>> = z.array(
      generateZODSchema(schema.items) as z.ZodTypeAny,
    );

    if (isOptional) {
      nestedSchema = nestedSchema.optional();
    }

    return nestedSchema;
  }

  if (schema.type === 'object') {
    const propertySchemas: z.ZodRawShape = Object.entries(
      schema.properties,
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
