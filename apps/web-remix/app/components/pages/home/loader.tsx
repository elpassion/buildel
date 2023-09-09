import { LoaderArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);

    const { data: organizations } = await fetch(
      OrganizationsResponse,
      `/organizations`
    );

    if (organizations.data.length === 0) return redirect(`/organizations/new`);

    return redirect(`/${organizations.data.at(0)!.id}/pipelines`);
  })(args);
}

const OrganizationsResponse = z.object({
  data: z.array(
    z.object({
      id: z.number(),
    })
  ),
});
