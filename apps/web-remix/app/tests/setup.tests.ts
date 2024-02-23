import { createRemixStub, RemixStubProps } from "@remix-run/testing";
import {
  LoaderFunctionArgs,
  LoaderFunction,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
import { ICurrentUser } from "~/api/CurrentUserApi";
import { setCurrentUser } from "~/utils/currentUser.server";

type RemixRoutesProps = Parameters<typeof createRemixStub>;

export const setupRoutes = (
  routes: RemixRoutesProps[0],
  ctx?: RemixRoutesProps[1]
) => createRemixStub(routes, ctx);

export type RoutesProps = RemixStubProps;

export const getBuildelCookie = () => {
  return `_buildel_key=123`;
};

export const getSessionCookie = async (
  request: Request,
  user?: ICurrentUser | null
) => {
  if (user === null) return "__session";
  return await setCurrentUser(request, user ?? { id: 1 });
};

export const loaderWithSession = (
  loader: LoaderFunction,
  user?: ICurrentUser | null
) => {
  return async (args: LoaderFunctionArgs, user?: ICurrentUser) => {
    args.request.headers.set(
      "cookie",
      `${getBuildelCookie()};${await getSessionCookie(args.request, user)}`
    );
    return loader(args);
  };
};

export const actionWithSession = (
  action: ActionFunction,
  user?: ICurrentUser | null
) => {
  return async (args: ActionFunctionArgs) => {
    args.request.headers.set(
      "cookie",
      `${getBuildelCookie()};${await getSessionCookie(args.request, user)}`
    );

    return action(args);
  };
};
