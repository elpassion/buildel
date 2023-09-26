import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { PipelineResponse } from "../contracts";
import { schema } from "./schema";
import { routes } from "~/utils/routes.utils";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const { data } = await fetch(
        PipelineResponse,
        `/organizations/${params.organizationId}/pipelines`,
        {
          method: "POST",
          body: JSON.stringify(result.data),
        }
      );

      return redirect(routes.pipeline(params.organizationId, data.id));
    },
  })(actionArgs);
}
