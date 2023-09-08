import { ActionArgs, json, redirect } from "@remix-run/node";
import { merge } from "lodash";
import { ZodEffects, ZodObject, ZodRawShape, ZodType, z } from "zod";

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
        return json({ errors: e.fieldErrors }, { status: 400 });
      }
      throw e;
    }

    return notFound();
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

  if (!response.ok) {
    console.log(await response.text());
    throw redirect("/login");
  }

  const jsonResponse = await response.json();

  const pipelines = schema.parse(jsonResponse);

  return pipelines;
}

function requestFetchTyped(actionArgs: ActionArgs): typeof fetchTyped {
  return (schema, url, options) => {
    console.log(
      url,
      merge(options, {
        headers: {
          "Content-Type": "application/json",
          Cookie: actionArgs.request.headers.get("cookie")!,
        },
      })
    );
    return fetchTyped(
      schema,
      "http://127.0.0.1:4000/api/organizations" + url,
      merge(options, {
        headers: {
          "Content-Type": "application/json",
          Cookie: actionArgs.request.headers.get("cookie")!,
        },
      })
    );
  };
}
