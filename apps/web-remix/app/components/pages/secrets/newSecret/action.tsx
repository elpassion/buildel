import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { SecretKeyResponse } from "../contracts";
import { validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "./schema";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      await fetch(
        SecretKeyResponse,
        `/organizations/${params.organizationId}/secrets`,
        { method: "POST", body: JSON.stringify(result.data) }
      );

      return redirect(routes.secrets(params.organizationId), {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Secret created",
              description: `You've successfully created a new secret`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
