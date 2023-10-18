import { z } from "zod";

export function getDefaults<T extends z.ZodTypeAny>(
  schema: z.AnyZodObject | z.ZodEffects<any>
): z.infer<T> {
  // Check if it's a ZodEffect
  if (schema instanceof z.ZodEffects) {
    // Check if it's a recursive ZodEffect
    if (schema.innerType() instanceof z.ZodEffects)
      return getDefaults(schema.innerType());
    // return schema inner shape as a fresh zodObject
    return getDefaults(z.ZodObject.create(schema.innerType().shape));
  }

  function getDefaultValue(schema: z.ZodTypeAny): unknown {
    if (schema instanceof z.ZodDefault) return schema._def.defaultValue();
    // return an empty array if it is
    if (schema instanceof z.ZodArray) return [];
    // return an empty string if it is
    if (schema instanceof z.ZodString) return "";
    // return an content of object recursivly
    if (schema instanceof z.ZodObject) return getDefaults(schema);

    if (!("innerType" in schema._def)) return undefined;
    return getDefaultValue(schema._def.innerType);
  }

  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      return [key, getDefaultValue(value)];
    })
  );
}
