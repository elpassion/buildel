import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { merge } from "lodash";
import { validationError } from "remix-validated-form";
import {
  NotFoundError,
  UnauthorizedError,
  UnknownAPIError,
  ValidationError,
} from "./utils/errors.server";
import { fetchTyped } from "./utils/fetch.server";
import { setToastError } from "./utils/toast.error.server";
import { getSession } from "./session.server";

export const loaderBuilder =
  <T>(fn: (args: LoaderArgs, helpers: { fetch: typeof fetchTyped }) => T) =>
  async (args: LoaderArgs) => {
    const notFound = () => json(null, { status: 404 });
    try {
      return await fn(args, { fetch: await requestFetchTyped(args) });
    } catch (e) {
      if (e instanceof UnknownAPIError) {
        throw json(
          { error: "Unknown API error" },
          {
            status: 500,
            headers: {
              "Set-Cookie": await setToastError(
                args.request,
                "Unknown API error"
              ),
            },
          }
        );
      } else if (e instanceof NotFoundError) {
        throw notFound();
      } else if (e instanceof UnauthorizedError) {
        throw redirect("/login");
      }

      throw e;
    }
  };

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
                fetch: await requestFetchTyped(actionArgs),
              })
            : notFound();
        case "DELETE":
          return handlers.delete
            ? await handlers.delete(actionArgs, {
                fetch: await requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PATCH":
          return handlers.patch
            ? await handlers.patch(actionArgs, {
                fetch: await requestFetchTyped(actionArgs),
              })
            : notFound();
        case "PUT":
          return handlers.put
            ? await handlers.put(actionArgs, {
                fetch: await requestFetchTyped(actionArgs),
              })
            : notFound();
        case "GET":
          return handlers.get
            ? await handlers.get(actionArgs, {
                fetch: await requestFetchTyped(actionArgs),
              })
            : notFound();
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return validationError({ fieldErrors: e.fieldErrors });
      } else if (e instanceof UnauthorizedError) {
        throw redirect("/login");
      } else if (e instanceof NotFoundError) {
        throw notFound();
      } else if (e instanceof UnknownAPIError) {
        return json(
          { error: "Unknown API error" },
          {
            status: 500,
            headers: {
              "Set-Cookie": await setToastError(
                actionArgs.request,
                "Unknown API error"
              ),
            },
          }
        );
      }
      throw e;
    }

    return notFound();
  };

async function requestFetchTyped(
  actionArgs: ActionArgs
): Promise<typeof fetchTyped> {
  const session = await getSession(actionArgs.request.headers.get("cookie"));
  const token = session.get("apiToken");

  return (schema, url, options) => {
    return fetchTyped(
      schema,
      "http://127.0.0.1:4000/api" + url,
      merge(options || {}, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `_buildel_key=${token}`,
        },
      })
    );
  };
}
