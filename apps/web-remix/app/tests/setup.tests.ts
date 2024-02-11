import { createRemixStub, RemixStubProps } from "@remix-run/testing";
import {
  LoaderFunctionArgs,
  LoaderFunction,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/node";

type RemixRoutesProps = Parameters<typeof createRemixStub>;

export const setupRoutes = (
  routes: RemixRoutesProps[0],
  ctx?: RemixRoutesProps[1]
) => createRemixStub(routes, ctx);

export type RoutesProps = RemixStubProps;

export const getSessionCookie = () => {
  return "_buildel_key=123";
};

export const loaderWithSession = (loader: LoaderFunction) => {
  return (args: LoaderFunctionArgs) => {
    args.request.headers.set("cookie", getSessionCookie());
    return loader(args);
  };
};

export const actionWithSession = (action: ActionFunction) => {
  return (args: ActionFunctionArgs) => {
    args.request.headers.set("cookie", getSessionCookie());
    return action(args);
  };
};
