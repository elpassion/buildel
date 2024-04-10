import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { AuthApi } from "~/api/auth/AuthApi";
import { actionBuilder } from "~/utils.server";
import { routes } from "~/utils/routes.utils";
import { schema } from "./schema";
import { setServerToast } from "~/utils/toast.server";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const authApi = new AuthApi(fetch);

      await authApi.signUpInvitation(result.data);

      const redirectTo = routes.login;

      return redirect(redirectTo, {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Account created",
              description: `Your account has been created and you have been added to organization. Now, you can sign in!`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
