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
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.get("apiToken")) throw redirect("/login");
}

export async function requireNotLogin(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.get("apiToken")) throw redirect("/");
}
