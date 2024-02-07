import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { setServerToast } from "~/utils/toast.server";
import { routes } from "~/utils/routes.utils";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { z } from "zod";
import { CreateAliasSchema } from "~/api/pipeline/pipeline.contracts";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(CreateAliasSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);

      const alias = await pipelineApi.createAlias(
        params.organizationId,
        params.pipelineId,
        result.data
      );

      return redirect(
        routes.pipelineBuild(params.organizationId, params.pipelineId, {
          alias: alias.data.id,
        }),
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Alias created",
                description: `You've successfully created workflow alias`,
              },
            }),
          },
        }
      );
    },
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing pipelineId");

      const validator = withZod(z.object({ id: z.number() }));

      const result = await validator.validate(await actionArgs.request.json());

      if (result.error) return validationError(result.error);

      const pipelineApi = new PipelineApi(fetch);

      await pipelineApi.deleteAlias(
        params.organizationId,
        params.pipelineId,
        result.data.id
      );

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Alias deleted",
                description: `You've successfully deleted workflow alias`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
