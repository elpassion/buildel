import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { requireLogin } from "~/session.server";
import { ValidationError } from "~/utils/errors";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    invariant(token, "token not found");

    const organizationApi = new OrganizationApi(fetch);

    try {
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
    } catch (e) {
      let errorDescription = `Something went wrong with invitation process.`;
      if (e instanceof ValidationError) {
        errorDescription = `This invitation was sent to a different email address.`;
      }

      return redirect(routes.dashboard, {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            error: {
              title: "Invitation failed",
              description: errorDescription,
            },
          }),
        },
      });
    }
  })(args);
}
