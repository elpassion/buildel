import { redirect, createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  apiToken?: string;
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
  if (!cookie?.includes("_buildel_key")) throw redirect("/login");
}

export async function requireNotLogin(request: Request) {
  const cookie = request.headers.get("Cookie");
  if (cookie?.includes("_buildel_key")) throw redirect("/");
}
