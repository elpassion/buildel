import { ActionArgs, json, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { z } from "zod";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";
import { commitSession, getSession } from "~/session.server";
import cookie from "cookie";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const response = await fetch(z.any(), "/users/log_in", {
        method: "POST",
        body: JSON.stringify(result.data),
      });

      const session = await getSession(request.headers.get("Cookie"));
      const parsedCookie = cookie.parse(response.headers.get("Set-Cookie")!);
      session.set("apiToken", parsedCookie._buildel_key);

      return redirect("/", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    },
  })(actionArgs);
}
