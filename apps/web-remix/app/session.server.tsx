import { redirect, createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  apiToken?: string;
};

type SessionFlashData = {
  error: string;
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
