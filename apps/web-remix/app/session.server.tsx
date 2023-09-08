import { redirect } from "@remix-run/node";

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
