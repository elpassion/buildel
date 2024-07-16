import { json } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }) => {
    await requireLogin(request);
    return json({});
  })(args);
}
