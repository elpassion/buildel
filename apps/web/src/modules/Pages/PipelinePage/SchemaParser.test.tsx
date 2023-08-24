import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { JSONSchemaField } from '~/modules/Pipelines/pipelines.types';
import { generateZODSchema } from './SchemaParser';

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

  test('correctly parses string enum field', () => {
    const schema: JSONSchemaField = {
      type: 'string',
      title: 'test',
      description: 'test',
      enum: ['test1', 'test2'],
      enumPresentAs: 'radio',
    };
    const zodSchema = generateZODSchema(schema);
    expect(zodSchema.safeParse('test1')).toEqual({
      success: true,
      data: 'test1',
    });
    expect(zodSchema.safeParse('test')).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "received": "test",
          "code": "invalid_enum_value",
          "options": [
            "test1",
            "test2"
          ],
          "path": [],
          "message": "Invalid enum value. Expected 'test1' | 'test2', received 'test'"
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
