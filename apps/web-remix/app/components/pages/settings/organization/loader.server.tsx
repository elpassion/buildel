import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const organizationApi = new OrganizationApi(fetch);

    const apiKeyPromise = organizationApi.getApiKey(params.organizationId);

    const organizationPromise = organizationApi.getOrganization(
      params.organizationId
    );

    const [apiKey, organization] = await Promise.all([
      apiKeyPromise,
      organizationPromise,
    ]);

    return json({
      apiKey: apiKey.data,
      organization: organization.data,
      organizationId: params.organizationId,
    });
  })(args);
}
