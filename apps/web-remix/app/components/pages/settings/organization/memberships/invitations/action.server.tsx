import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { setServerToast } from "~/utils/toast.server";
import { assert } from "~/utils/assert";
import { OrganizationApi } from "~/api/organization/OrganizationApi";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const invitationId = (await request.formData()).get("invitationId");

      assert(invitationId);

      const organizationApi = new OrganizationApi(fetch);

      await organizationApi.deleteInvitation(params.organizationId, invitationId as string);

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Secret deleted",
                description: `You've successfully deleted the secret`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
