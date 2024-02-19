import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { getCurrentUser } from "~/utils/currentUser.server";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { user } = await getCurrentUser(request);

    return json({ user });
  })(args);
}
