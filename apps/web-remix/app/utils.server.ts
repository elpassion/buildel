import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { merge } from "lodash";
import { ZodType, z } from "zod";

export const loaderBuilder =
  <T>(fn: (args: LoaderArgs, helpers: { fetch: typeof fetchTyped }) => T) =>
  (args: LoaderArgs) =>
    fn(args, { fetch: requestFetchTyped(args) });

export const actionBuilder =
  (handlers: {
    post?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
    delete?: (
      args: ActionArgs,
      helpers: { fetch: typeof fetchTyped }
    ) => unknown;
    patch?: (
      args: ActionArgs,
      helpers: { fetch: typeof fetchTyped }
    ) => unknown;
    put?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
    get?: (args: ActionArgs, helpers: { fetch: typeof fetchTyped }) => unknown;
  }) =>
  async (actionArgs: ActionArgs) => {
    const notFound = () => json(null, { status: 404 });
    try {
      switch (actionArgs.request.method) {
        case "POST":
          return handlers.post
            ? await handlers.post(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "DELETE":
          return handlers.delete
            ? await handlers.delete(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PATCH":
          return handlers.patch
            ? await handlers.patch(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PUT":
          return handlers.put
            ? await handlers.put(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
        case "GET":
          return handlers.get
            ? await handlers.get(actionArgs, {
                fetch: requestFetchTyped(actionArgs),
              })
            : notFound();
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return json({ fieldErrors: e.fieldErrors }, { status: 422 });
      }
      console.error({ error: e });
      throw e;
    }

    return notFound();
  };

export class ValidationError<T> extends Error {
  constructor(
    public readonly fieldErrors: {
      [P in allKeys<T>]?: string;
    }
  ) {
    super();
  }
}

declare type allKeys<T> = T extends any ? keyof T : never;

type ParsedResponse<T> = Response & { data: T };

export async function fetchTyped<T extends ZodType>(
  schema: T,
  url: string,
  options?: RequestInit | undefined
): Promise<ParsedResponse<z.infer<T>>> {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 422) {
      const jsonResponse = await response.json();
      throw new ValidationError(deepMergeAPIErrors(jsonResponse.errors));
    } else if (response.status === 401) {
      throw redirect("/login");
    }
  }

  const jsonResponse = await response.json();

  const data = schema.parse(jsonResponse);

  return Object.assign(response, { data, error: null });
}

function requestFetchTyped(actionArgs: ActionArgs): typeof fetchTyped {
  return (schema, url, options) => {
    return fetchTyped(
      schema,
      "http://127.0.0.1:4000/api" + url,
      merge(options || {}, {
        headers: {
          "Content-Type": "application/json",
          Cookie: actionArgs.request.headers.get("cookie")!,
        },
      })
    );
  };
}

type APIErrorField =
  | string[]
  | APIErrorField[]
  | { [key: string]: APIErrorField };

type ErrorField = string | ErrorField[] | { [key: string]: ErrorField };

function deepMergeAPIErrors(
  errors: Record<string, APIErrorField>
): Record<string, ErrorField> {
  const result: Record<string, ErrorField> = {};

  for (const [key, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      if (typeof value[0] === "string") result[key] = value.join(" ");
      else result[key] = (value as any).map(deepMergeAPIErrors);
    } else if (typeof value === "object") {
      result[key] = deepMergeAPIErrors(value);
    }
  }

  return result;
}
