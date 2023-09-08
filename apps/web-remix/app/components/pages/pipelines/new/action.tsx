import { ActionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { actionBuilder, fetchTyped } from "~/utils.server";
import { schema } from "./schema";
import { validationError } from "remix-validated-form";
import { PipelineResponse } from "../list/contracts";
import invariant from "tiny-invariant";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(
        await actionArgs.request.formData()
      );

      if (result.error) return validationError(result.error);

      const pipeline = await fetch(
        PipelineResponse,
        `/organizations/${params.organizationId}/pipelines`,
        {
          method: "POST",
          body: JSON.stringify({
            pipeline: { ...result.data, config: { version: "1", blocks: [] } },
          }),
        }
      );

      return redirect(`/${params.organizationId}/pipelines/${pipeline.id}`);
    },
  })(actionArgs);
}
