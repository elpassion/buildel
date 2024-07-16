import { createRemixStub } from "@remix-run/testing";
import type { ICurrentUser } from "~/api/CurrentUserApi";
import { setCurrentUser } from "~/utils/currentUser.server";
import { setOrganizationId } from "~/utils/toast.server";
import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { RemixStubProps } from "@remix-run/testing";

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
  args?: ISessionData
) => {
  let sessionCookie = "";

  if (args?.user !== null) {
    sessionCookie = await setCurrentUser(request, args?.user ?? { id: 1 });
  }
  if (args?.organizationId) {
    sessionCookie = await setOrganizationId(sessionCookie, args.organizationId);
  }

  return sessionCookie;
};

type ISessionData = {
  user?: ICurrentUser | null;
  organizationId?: number;
};

export const loaderWithSession = (
  loader: LoaderFunction,
  sessionData?: ISessionData
) => {
  return async (args: LoaderFunctionArgs) => {
    args.request.headers.set(
      "cookie",
      `${getBuildelCookie()};${await getSessionCookie(
        args.request,
        sessionData
      )}`
    );
    return loader(args);
  };
};

export const actionWithSession = (
  action: ActionFunction,
  sessionData?: ISessionData
) => {
  return async (args: ActionFunctionArgs) => {
    const cookie = [
      getBuildelCookie(),
      await getSessionCookie(args.request, sessionData),
    ].join(";");

    args.request.headers.set("cookie", cookie);

    return action(args);
  };
};
