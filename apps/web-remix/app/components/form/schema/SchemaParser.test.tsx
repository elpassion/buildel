import { test, describe, expect } from "vitest";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import {
  numberSchemaFixture,
  stringSchemaFixture,
} from "~/tests/fixtures/schema.fixtures";

describe("GenerateZodSchema", () => {
  describe("for basic string type", () => {
    const schema = generateZODSchema(stringSchemaFixture() as any);

    test("should correctly validate zod schema", async () => {
      const result = schema.safeParse("Hello_schema");

      expect(result.success).toBe(true);
    });

    test("should validate min length", async () => {
      const result = schema.safeParse("H");

      expect(result.success).toBe(false);
    });

    test("should validate max length", async () => {
      const result = schema.safeParse("Hello_to_long_schema");

      expect(result.success).toBe(false);
    });

    test("should validate regex pattern", async () => {
      const result = schema.safeParse("Hello<>");

      expect(result.success).toBe(false);
    });
  });

  describe("for number type", () => {
    const schema = generateZODSchema(numberSchemaFixture() as any);

    test("should correctly validate zod schema", async () => {
      const result = schema.safeParse(1);

      expect(result.success).toBe(true);
    });

    test("should validate minimum", async () => {
      const result = schema.safeParse(-1);

      expect(result.success).toBe(false);
    });

    test("should validate maximum", async () => {
      const result = schema.safeParse(3);

      expect(result.success).toBe(false);
    });

    test("should validate default", async () => {
      // @ts-ignore
      const result = schema.safeParse();

      expect(result.success).toBe(true);
      // @ts-ignore
      expect(result.data).toBe(0.7);
    });
  });
});
