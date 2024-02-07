import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { schema } from "./schema";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { PipelineApi } from "~/api/PipelineApi";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(schema);
      invariant(params.organizationId, "organizationId not found");

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);
      const { data } = await pipelineApi.createPipeline(
        params.organizationId,
        result.data
      );

      return redirect(routes.pipeline(params.organizationId, data.id), {
        headers: {
          "Set-Cookie": await setServerToast(request, {
            success: {
              title: "Workflow created",
              description: `You've created ${data.name} workflow`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
