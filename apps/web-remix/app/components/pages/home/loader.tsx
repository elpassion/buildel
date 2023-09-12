import { LoaderArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { data: organizations } = await fetch(
      OrganizationsResponse,
      `/organizations`
    );

    const organization = organizations.data.at(0);

    if (organization) {
      return redirect(routes.pipelines(organization.id));
    } else {
      return redirect(routes.newOrganization());
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
