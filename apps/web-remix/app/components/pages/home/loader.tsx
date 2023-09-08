import { LoaderArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    requireLogin(request);

    // const pipelines = await fetch(
    //   PipelinesResponse,
    //   `/organizations`
    // );

    return redirect(`/1/pipelines`);
  })(args);
}
