import { json } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { getCurrentUser } from "~/utils/currentUser.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { user } = await getCurrentUser(request);

    return json({ user });
  })(args);
}
