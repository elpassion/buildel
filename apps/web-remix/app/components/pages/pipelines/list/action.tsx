import { ActionFunctionArgs, json } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { setServerToast } from "~/utils/toast.server";
import { PipelineApi } from "~/api/pipeline/PipelineApi";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
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
