import { json, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { CreateFromTemplateSchema } from "~/api/organization/organization.contracts";
import { OrganizationApi } from "~/api/organization/OrganizationApi";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { setServerToast } from "~/utils/toast.server";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

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
                title: "Workflow created",
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
