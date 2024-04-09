import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import invariant from "tiny-invariant";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    invariant(token, "token not found");

    const organizationApi = new OrganizationApi(fetch);

    await organizationApi.acceptInvitation(token);

    return redirect(routes.dashboard, {
      headers: {
        "Set-Cookie": await setServerToast(request, {
          success: {
            title: "Invitation accepted",
            description: `You've been added to organization.`,
          },
        }),
      },
    });
  })(args);
}
