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

      const response = await fetch(OrganizationsResponse, "/organizations", {
        method: "POST",
        body: JSON.stringify(result.data),
      });

      return redirect(`/${response.data.data.id}/pipelines`);
    },
  })(actionArgs);
}

const OrganizationsResponse = z.object({
  data: z.object({
    id: z.number(),
  }),
});
