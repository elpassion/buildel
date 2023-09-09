import { redirect, createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const {
  getSession: getRemixSession,
  commitSession,
  destroySession,
} = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__session",
  },
});

export { getRemixSession, commitSession, destroySession };

export function requireLogin(request: Request) {
  const userId = getSession(request);
  if (!userId) throw redirect("/login");
}

export function requireNotLogin(request: Request) {
  const userId = getSession(request);
  if (userId) throw redirect("/");
}

function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  const userId = cookie?.split("_buildel_key=")[1];
  return userId;
}
