import { redirect } from "@remix-run/node";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { getOrganizationId } from "~/utils/toast.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const organizationApi = new OrganizationApi(fetch);

    const { data: organizations } = await organizationApi.getOrganizations();

    const organizationId = await getOrganizationId(
      request.headers.get("Cookie") || ""
    );
    const savedOrganizationIndex = organizations.data.findIndex(
      (org) => org.id === organizationId
    );
    const organization = organizations.data.at(savedOrganizationIndex);

    if (organization) {
      return redirect(routes.pipelines(organization.id));
    } else {
      return redirect(routes.newOrganization());
    }
  })(args);
}
