import { LoaderArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { data: organizations } = await fetch(
      OrganizationsResponse,
      `/organizations`
    );

    const organization = organizations.data.at(0);

    if (organization) {
      return redirect(`/${organization.id}/pipelines`);
    } else {
      return redirect(`/organizations/new`);
    }
  })(args);
}

const OrganizationsResponse = z.object({
  data: z.array(
    z.object({
      id: z.number(),
    })
  ),
});
