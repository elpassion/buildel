import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { setServerToast } from "~/utils/toast.server";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { CreateFromTemplateSchema } from "~/api/organization/organization.contracts";
import { routes } from "~/utils/routes.utils";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const validator = withZod(CreateFromTemplateSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const organizationApi = new OrganizationApi(fetch);
      const {
        data: { pipeline_id },
      } = await organizationApi.createFromTemplate(
        params.organizationId,
        result.data
      );

      return redirect(
        routes.pipelineBuild(params.organizationId, pipeline_id),
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Workflow create",
                description: `You've successfully created workflow`,
              },
            }),
          },
        }
      );
    },
    delete: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");

      const pipelineId = (await request.formData()).get("pipelineId");
      invariant(pipelineId, "Missing pipelineId");

      const pipelineApi = new PipelineApi(fetch);
      await pipelineApi.deletePipeline(
        params.organizationId,
        pipelineId.toString()
      );

      return json(
        {},
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Workflow deleted",
                description: `You've successfully deleted workflow`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
