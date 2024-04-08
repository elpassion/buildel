import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { getCurrentUser } from "~/utils/currentUser.server";
import { OrganizationResponse } from "~/api/organization/organization.contracts";
import invariant from "tiny-invariant";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const { user } = await getCurrentUser(request);

    const organization = await fetch(
      OrganizationResponse,
      `/organizations/${params.organizationId}`
    );

    return json({ user, organization: organization.data });
  })(args);
}
