import { json, LoaderArgs } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request }) => {
    await requireLogin(request);
    return json({});
  })(args);
}
