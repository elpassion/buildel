import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { CurrentUserResponse } from "~/api/CurrentUserApi";
import { AuthApi } from "~/api/auth/AuthApi";
import { actionBuilder } from "~/utils.server";
import { setCurrentUser } from "~/utils/currentUser.server";
import { routes } from "~/utils/routes.utils";
import { schema } from "./schema";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const authApi = new AuthApi(fetch);

      const response = await authApi.signUp(result.data.user);

      const authCookie = response.headers.get("Set-Cookie")!;

      const meResponse = await fetch(CurrentUserResponse, "/users/me", {
        headers: {
          Cookie: authCookie,
        },
      });

      const sessionCookie = await setCurrentUser(request, meResponse.data);

      const headers = new Headers();
      headers.append("Set-Cookie", authCookie);
      headers.append("Set-Cookie", sessionCookie);

      return redirect(routes.dashboard, {
        headers,
      });
    },
  })(actionArgs);
}
