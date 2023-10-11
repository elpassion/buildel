import { commitSession, getSession, SessionToast } from "~/session.server";

export async function setServerToast(
  request: Request,
  args?: {
    error?: SessionToast | string;
    success?: SessionToast | string;
    warning?: SessionToast | string;
  }
): Promise<string> {
  const session = await getSession(request.headers.get("Cookie")!);

  if (args?.error) {
    session.flash("error", args.error);
  }
  if (args?.success) {
    session.flash("success", args.success);
  }
  if (args?.warning) {
    session.flash("warning", args.warning);
  }

  return await commitSession(session);
}

export async function getServerToast(request: Request): Promise<{
  error: SessionToast | string | undefined;
  success: SessionToast | string | undefined;
  warning: SessionToast | string | undefined;
  cookie: string;
}> {
  const session = await getSession(request.headers.get("Cookie")!);
  const error = session.get("error");
  const success = session.get("success");
  const warning = session.get("warning");

  return { cookie: await commitSession(session), error, success, warning };
}
