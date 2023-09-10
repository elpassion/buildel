import { ActionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { z } from "zod";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";

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

      return redirect("/", {
        headers: { "Set-Cookie": response.headers.get("Set-Cookie")! },
      });
    },
  })(actionArgs);
}
