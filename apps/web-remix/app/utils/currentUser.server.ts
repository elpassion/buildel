import { commitSession, getSession, logout } from "~/session.server";
import { ICurrentUser } from "~/api/CurrentUserApi";
import { redirect } from "@remix-run/node";

export async function setCurrentUser(
  request: Request,
  user: ICurrentUser
): Promise<string> {
  const session = await getSession(request.headers.get("Cookie")!);

  session.set("user", user);

  return await commitSession(session);
}

export async function getCurrentUser(request: Request): Promise<{
  user: ICurrentUser;
}> {
  const session = await getSession(request.headers.get("Cookie")!);
  const user = session.get("user");

  if (!user) {
    throw redirect("/login", {
      headers: await logout(request, {
        error: { title: "Unauthorized", description: "Session expired" },
      }),
    });
  }

  return { user };
}
