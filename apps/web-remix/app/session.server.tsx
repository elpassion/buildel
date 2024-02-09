import { redirect, createCookieSessionStorage } from "@remix-run/node";
import { ICurrentUser } from "~/api/CurrentUserApi";
import { setServerToast } from "~/utils/toast.server";

type SessionData = {
  apiToken?: string;
  user?: ICurrentUser;
};

export type SessionToast = {
  title: string;
  description: string;
};

export type SessionFlashData = {
  error: SessionToast | string;
  success: SessionToast | string;
  warning: SessionToast | string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET as string],
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };

export async function requireLogin(request: Request) {  
  const cookie = request.headers.get("Cookie");
  if (!cookie?.includes("_buildel_key")) {
    const fromURL = new URL(request.url);
    const toURL = new URL("/login", fromURL.origin);

    toURL.searchParams.set("redirectTo", fromURL.pathname);

    throw redirect(toURL.toString(), { headers: await logout(request) });
  }
}

export async function requireNotLogin(request: Request) {
  const cookie = request.headers.get("Cookie");
  if (cookie?.includes("_buildel_key")) {
    const url = new URL(request.url);
    const toURL = url.searchParams.get("redirectTo") || "/";
    throw redirect(toURL);
  }
}

export async function logout(
  request: Request,
  args?: {
    error?: SessionToast | string;
    success?: SessionToast | string;
    warning?: SessionToast | string;
  }
) {
  const session = await getSession(request.headers.get("Cookie"));

  const headers = new Headers();
  headers.append("Set-Cookie", await destroySession(session));
  headers.append(
    "Set-Cookie",
    "_buildel_key=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );

  if (args) {
    headers.append("Set-Cookie", await setServerToast(request, args));
  }

  return headers;
}
