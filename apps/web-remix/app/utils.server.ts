import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import merge from "lodash.merge";
import { validationError } from "remix-validated-form";
import {
  NotFoundError,
  UnauthorizedError,
  UnknownAPIError,
  ValidationError,
} from "./utils/errors.server";
import { fetchTyped } from "./utils/fetch.server";
import { setServerToast } from "./utils/toast.server";
import { logout } from "~/session.server";

export const loaderBuilder =
  <T>(
    fn: (args: LoaderFunctionArgs, helpers: { fetch: typeof fetchTyped }) => T
  ) =>
  async (args: LoaderFunctionArgs) => {
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
              "Set-Cookie": await setServerToast(args.request, {
                error: "Unknown API error",
              }),
            },
          }
        );
      } else if (e instanceof NotFoundError) {
        throw notFound();
      } else if (e instanceof UnauthorizedError) {
        throw redirect("/login", {
          headers: await logout(args.request, {
            error: { title: "Unauthorized", description: "Session expired" },
          }),
        });
      }

      throw e;
    }
  };

type ActionHandler<T> = (
  args: ActionFunctionArgs,
  helpers: { fetch: typeof fetchTyped }
) => Promise<T>;

export const actionBuilder =
  <T>(handlers: {
    post?: ActionHandler<TypedResponse<T>>;
    delete?: ActionHandler<TypedResponse<T>>;
    patch?: ActionHandler<TypedResponse<T>>;
    put?: ActionHandler<TypedResponse<T>>;
    get?: ActionHandler<TypedResponse<T>>;
  }) =>
  async (actionArgs: ActionFunctionArgs) => {
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
        throw redirect("/login", {
          headers: await logout(actionArgs.request, {
            error: { title: "Unauthorized", description: "Session expired" },
          }),
        });
      } else if (e instanceof NotFoundError) {
        throw notFound();
      } else if (e instanceof UnknownAPIError) {
        return json(
          { error: "Unknown API error" },
          {
            status: 500,
            headers: {
              "Set-Cookie": await setServerToast(actionArgs.request, {
                error: "Unknown API error",
              }),
            },
          }
        );
      }
      throw e;
    }

    return notFound();
  };

async function requestFetchTyped(
  actionArgs: ActionFunctionArgs
): Promise<typeof fetchTyped> {
  return (schema, url, options) => {
    return fetchTyped(
      schema,
      `${process.env.PAGE_URL}/super-api` + url,
      merge(
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: actionArgs.request.headers.get("cookie"),
          },
        },
        options || {}
      )
    );
  };
}
