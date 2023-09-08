import { ActionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { actionBuilder, fetchTyped } from "~/utils.server";
import { schema } from "./schema";
import { validationError } from "remix-validated-form";
import { PipelineResponse } from "../list/contracts";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({
    put: async ({ params, request }) => {
      requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(schema);

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      await fetchTyped(
        PipelineResponse,
        `http://127.0.0.1:4000/api/organizations/${params.organizationId}/pipelines/${params.pipelineId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie")!,
          },
          method: "PUT",
          body: JSON.stringify({
            pipeline: result.data,
          }),
        }
      );

      return redirect(
        `/${params.organizationId}/pipelines/${params.pipelineId}`
      );
    },
  })(actionArgs);
}
