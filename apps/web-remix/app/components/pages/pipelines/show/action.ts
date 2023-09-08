import { ActionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";
import { validationError } from "remix-validated-form";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    put: async ({ params, request }) => {
      requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(schema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      return redirect(
        `/${params.organizationId}/pipelines/${params.pipelineId}`
      );
    },
  })(actionArgs);
}
