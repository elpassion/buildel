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

    const apiKeyPromise = organizationApi.getApiKey(params.organizationId);

    const organizationPromise = organizationApi.getOrganization(
      params.organizationId
    );

    const membershipsPromise = organizationApi.getMemberships(
      params.organizationId
    );

    const [apiKey, organization, memberships] = await Promise.all([
      apiKeyPromise,
      organizationPromise,
      membershipsPromise,
    ]);

    return json({
      apiKey: apiKey.data,
      organization: organization.data,
      memberships: memberships.data,
    });
  })(args);
}
