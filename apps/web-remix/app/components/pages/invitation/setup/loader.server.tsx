import { json, redirect } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

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
