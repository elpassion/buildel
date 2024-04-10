import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }) => {
    await requireNotLogin(request);

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return redirect(routes.login);
    }

    return json({ token });
  })(args);
}
