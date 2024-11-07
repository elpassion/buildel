import { describe, expect, test } from 'vitest';

import {
  checkDisplayWhenConditions,
  generateZODSchema,
} from '~/components/form/schema/SchemaParser';
import {
  arraySchemaFixture,
  booleanSchemaFixture,
  enumStringSchemaFixture,
  nestedObjectSchemaFixture,
  numberSchemaFixture,
  objectSchemaFixture,
  sectionSchemaFixture,
  stringSchemaFixture,
} from '~/tests/fixtures/schema.fixtures';

describe('GenerateZodSchema', () => {
  describe('for basic string type', () => {
    const schema = generateZODSchema(stringSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse('Hello_schema');

      expect(result.success).toBe(true);
    });

    test('should validate min length', async () => {
      const result = schema.safeParse('H');

      expect(result.success).toBe(false);
    });

    test('should validate max length', async () => {
      const result = schema.safeParse('Hello_to_long_schema');

      expect(result.success).toBe(false);
    });

    test('should validate regex pattern', async () => {
      const result = schema.safeParse('Hello<>');

      expect(result.success).toBe(false);
    });

    describe('with default value', () => {
      const schema = generateZODSchema(
        stringSchemaFixture({ default: 'hello_world' }) as any,
      );

      test('should fill with default', async () => {
        const result = schema.safeParse(undefined);

        expect(result.success).toBe(true);
        expect(result.data).toBe('hello_world');
      });
    });

    describe('with custom errors', () => {
      const schema = generateZODSchema(
        stringSchemaFixture({
          minLength: 30,
          errorMessages: { minLength: 'Nah... To short...' },
        }) as any,
      );

      test('should display custom minLength error', async () => {
        const result = schema.safeParse('Is it ok?');

        expect(result.success).toBe(false);
        expect(result.error?.errors[1].message).toBe('Nah... To short...');
      });
    });

    describe('with enum', () => {
      const schema = generateZODSchema(enumStringSchemaFixture() as any);

      test('should correctly validate zod schema', async () => {
        const result = schema.safeParse('openai');

        expect(result.success).toBe(true);
      });

      test('should validate enum value', async () => {
        const result = schema.safeParse('123');

        expect(result.success).toBe(false);
      });
    });
  });

  describe('for number type', () => {
    const schema = generateZODSchema(numberSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse(1);

      expect(result.success).toBe(true);
    });

    test('should validate minimum', async () => {
      const result = schema.safeParse(-1);

      expect(result.success).toBe(false);
    });

    test('should validate maximum', async () => {
      const result = schema.safeParse(3);

      expect(result.success).toBe(false);
    });

    test('should validate default', async () => {
      // @ts-ignore
      const result = schema.safeParse();

      expect(result.success).toBe(true);
      // @ts-ignore
      expect(result.data).toBe(0.7);
    });
  });

  describe('for boolean type', () => {
    const schema = generateZODSchema(booleanSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse(true);

      expect(result.success).toBe(true);
    });
  });

  describe('for array type', () => {
    const schema = generateZODSchema(arraySchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse(['Hello']);

      expect(result.success).toBe(true);
    });

    test('should validate min length', async () => {
      const result = schema.safeParse([]);

      expect(result.success).toBe(false);
    });

    test('should validate default', async () => {
      // @ts-ignore
      const result = schema.safeParse();

      // @ts-ignore
      expect(result.data).toStrictEqual(['Hi']);
      expect(result.success).toBe(true);
    });
  });

  describe('for object type', () => {
    const schema = generateZODSchema(objectSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse({ api_type: 'Hello' });

      expect(result.success).toBe(true);
    });

    test('should validate empty object', async () => {
      const result = schema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('for nested object type', () => {
    const schema = generateZODSchema(nestedObjectSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse({ nested_object: { api_type: '123' } });

      expect(result.success).toBe(true);
    });

    test('should validate nested object', async () => {
      const result = schema.safeParse({ nested_object: { api_type: '' } });

      expect(result.success).toBe(false);
    });
  });

  describe('for section type', () => {
    const schema = generateZODSchema(sectionSchemaFixture() as any);

    test('should correctly validate zod schema', async () => {
      const result = schema.safeParse({ model: 'oepnai' });

      expect(result.success).toBe(true);
    });

    test('should validate empty object', async () => {
      const result = schema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});

describe('DisplayWhen', () => {
  describe('for min value', () => {
    test('should return false if the condition is not met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { min: 3 } },
        { tool_worker: 0 },
      );

      expect(result).toBe(false);
    });

    test('should return true if the condition is met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { min: 3 } },
        { tool_worker: 3 },
      );

      expect(result).toBe(true);
    });

    test('should return true if key not found in ctx', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { min: 3 } },
        { tool_controller: 3 },
      );

      expect(result).toBe(true);
    });
  });

  describe('for max value', () => {
    test('should return false if the condition is not met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { max: 3 } },
        { tool_worker: 10 },
      );

      expect(result).toBe(false);
    });

    test('should return true if the condition is met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { max: 3 } },
        { tool_worker: 2 },
      );

      expect(result).toBe(true);
    });

    test('should return true if key not found in ctx', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { min: 3 } },
        { tool_controller: 34 },
      );

      expect(result).toBe(true);
    });
  });

  describe('for min and max values', () => {
    test('should return false if the condition is not met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { max: 3, min: 1 } },
        { tool_worker: 4 },
      );

      expect(result).toBe(false);
    });

    test('should return true if the condition is met', () => {
      const result = checkDisplayWhenConditions(
        { tool_worker: { max: 3, min: 2 } },
        { tool_worker: 2 },
      );

      expect(result).toBe(true);
    });
  });
});
