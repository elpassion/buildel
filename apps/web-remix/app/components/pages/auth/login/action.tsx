import { ActionArgs, json, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { signIn } from "~/models/user.server";
import { schema } from "./schema";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    post: async (actionArgs) => {
      const validator = withZod(schema);

      const result = await validator.validate(
        await actionArgs.request.formData()
      );

      if (result.error) return validationError(result.error);

      try {
        const { cookie } = await signIn(result.data);
        return redirect("/", { headers: { "Set-Cookie": cookie! } });
      } catch (error) {
        return json({ errors: { email: "dupa" } }, { status: 401 });
      }
    },
  })(actionArgs);
}
