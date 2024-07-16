import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { requireLogin } from "~/session.server";
import { assert } from "~/utils/assert";
import { setServerToast } from "~/utils/toast.server";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const invitationId = (await request.formData()).get("invitationId");

      assert(invitationId);

      const organizationApi = new OrganizationApi(fetch);

      await organizationApi.deleteInvitation(
        params.organizationId,
        invitationId as string
      );

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Invitation deleted",
                description: `You've successfully deleted the invitation`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
