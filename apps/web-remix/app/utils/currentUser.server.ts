import { ICurrentUser } from "~/api/CurrentUserApi";
import { commitSession, getSession } from "~/session.server";
import { UnauthorizedError } from "./errors";

export async function setCurrentUser(
  request: Request,
  user: ICurrentUser,
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
    throw new UnauthorizedError();
  }

  return { user };
}

export async function getCurrentUserOrNull(request: Request): Promise<{
  user: ICurrentUser | null;
}> {
  const session = await getSession(request.headers.get("Cookie") || "");
  const user = session.get("user") ?? null;

  return { user };
}
