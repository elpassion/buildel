import { ActionArgs, json, redirect } from "@remix-run/node";
import { ZodEffects, ZodObject, ZodRawShape, ZodType, z } from "zod";

export const actionBuilder =
  (handlers: {
    post?: (args: ActionArgs) => unknown;
    delete?: (args: ActionArgs) => unknown;
    patch?: (args: ActionArgs) => unknown;
    put?: (args: ActionArgs) => unknown;
    get?: (args: ActionArgs) => unknown;
  }) =>
  async (actionArgs: ActionArgs) => {
    const notFound = () => json(null, { status: 404 });
    try {
      switch (actionArgs.request.method) {
        case "POST":
          return handlers.post ? await handlers.post(actionArgs) : notFound();
        case "DELETE":
          return handlers.delete
            ? await handlers.delete(actionArgs)
            : notFound();
        case "PATCH":
          return handlers.patch ? await handlers.patch(actionArgs) : notFound();
        case "PUT":
          return handlers.put ? await handlers.put(actionArgs) : notFound();
        case "GET":
          return handlers.get ? await handlers.get(actionArgs) : notFound();
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return json({ errors: e.fieldErrors }, { status: 400 });
      }
      throw e;
    }

    return notFound();
  };

export const validateActionWithSchema = async <
  T extends ZodObject<ZodRawShape> | ZodEffects<ZodObject<ZodRawShape>>
>(
  actionArgs: ActionArgs,
  schema: T
) => {
  const { request } = actionArgs;
  const formData = await request.formData();

  const result = await schema.safeParseAsync(
    Object.fromEntries(formData.entries())
  );

  if (!result.success) {
    throw new ValidationError(result.error.formErrors.fieldErrors);
  }

  return result.data;
};

export class ValidationError<T> extends Error {
  constructor(
    public readonly fieldErrors: {
      [P in allKeys<T>]?: string[];
    }
  ) {
    super();
  }
}

declare type allKeys<T> = T extends any ? keyof T : never;

export async function fetchTyped<T extends ZodType>(
  schema: T,
  url: string,
  options: RequestInit | undefined
): Promise<z.infer<T>> {
  const response = await fetch(url, options);

  if (!response.ok) throw redirect("/login");

  const jsonResponse = await response.json();

  const pipelines = schema.parse(jsonResponse);

  return pipelines;
}
