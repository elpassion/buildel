import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { OrganizationApi } from "~/api/organization/OrganizationApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const organizationApi = new OrganizationApi(fetch);

    const membershipsPromise = organizationApi.getMemberships(
      params.organizationId
    );

    const [memberships] = await Promise.all([membershipsPromise]);

    return json({
      organizationId: params.organizationId,
      memberships: memberships.data,
    });
  })(args);
}
