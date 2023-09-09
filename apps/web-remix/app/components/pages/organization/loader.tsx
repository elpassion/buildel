import { LoaderArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import invariant from "tiny-invariant";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    //fetch organization and return 404 if not exist

    return redirect(`/${params.organizationId}/pipelines`);
  })(args);
}
