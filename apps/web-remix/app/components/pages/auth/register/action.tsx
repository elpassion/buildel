import { ActionArgs, json, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { z } from "zod";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    post: async (actionArgs, { fetch }) => {
      const validator = withZod(schema);

      const result = await validator.validate(
        await actionArgs.request.formData()
      );

      if (result.error) return validationError(result.error);

      try {
        const response = await fetch(z.any(), "/users/register", {
          method: "POST",
          body: JSON.stringify({ user: result.data }),
        });
        return redirect("/", {
          headers: { "Set-Cookie": response.headers.get("Set-Cookie")! },
        });
      } catch (error) {
        return json({ errors: { email: "dupa" } }, { status: 401 });
      }
    },
  })(actionArgs);
}
