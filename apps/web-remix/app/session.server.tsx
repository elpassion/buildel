import { redirect, createCookieSessionStorage } from "@remix-run/node";
import { ICurrentUser } from "~/api/CurrentUserApi";

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
    },
  });

export { getSession, commitSession, destroySession };

export async function requireLogin(request: Request) {
  const cookie = request.headers.get("Cookie");
  if (!cookie?.includes("_buildel_key")) {
    throw redirect("/login", { headers: await logout(request) });
  }
}

export async function requireNotLogin(request: Request) {
  const cookie = request.headers.get("Cookie");
  if (cookie?.includes("_buildel_key")) throw redirect("/");
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    "_buildel_key=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  headers.append("Set-Cookie", await destroySession(session));

  return headers;
}
