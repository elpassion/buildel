import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { z } from "zod";
import { validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "~/components/pages/variables/newSecret/schema";
import { routes } from "~/utils/routes.utils";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const name = (await request.formData()).get("name");

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/secrets/${name}`,
        { method: "DELETE" }
      );

      return json({});
    },
    put: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      await fetch(
        z.any(),
        `/organizations/${params.organizationId}/secrets/${result.data.name}`,
        { method: "PUT", body: JSON.stringify({ value: result.data.value }) }
      );

      return redirect(routes.secrets(params.organizationId));
    },
  })(actionArgs);
}
