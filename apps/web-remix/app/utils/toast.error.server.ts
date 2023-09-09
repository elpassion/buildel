import { commitSession, getRemixSession } from "~/session.server";

export async function setToastError(
  request: Request,
  error: string
): Promise<string> {
  const session = await getRemixSession(request.headers.get("Cookie")!);
  session.flash("error", error);

  return await commitSession(session);
}

export async function getToastError(
  request: Request
): Promise<{ error: string | undefined; cookie: string }> {
  const session = await getRemixSession(request.headers.get("Cookie")!);
  const error = session.get("error");

  return { cookie: await commitSession(session), error };
}
