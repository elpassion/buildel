import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { MembershipResponse } from "~/api/organization/organization.contracts";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const { data } = await fetch(
        MembershipResponse,
        `/organizations/${params.organizationId}/memberships`,
        {
          method: "POST",
          body: JSON.stringify(result.data),
        }
      );

      return redirect(routes.organizationInvitations(params.organizationId), {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Member invited",
              description: `You've invited ${data.data.user.email} to your organization.`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
