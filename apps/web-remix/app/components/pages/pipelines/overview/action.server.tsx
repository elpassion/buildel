import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { setServerToast } from "~/utils/toast.server";
import { actionBuilder } from "~/utils.server";
import type { ActionFunctionArgs} from "@remix-run/node";

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      invariant(params.pipelineId, "Missing organizationId");

      const runId = (await request.formData()).get("runId");
      invariant(runId, "Missing runId");

      const pipelineApi = new PipelineApi(fetch);
      const updatedRun = await pipelineApi.stopPipelineRun(
        params.organizationId,
        params.pipelineId,
        runId.toString()
      );

      return json(
        { run: updatedRun.data },
        {
          headers: {
            "Set-Cookie": await setServerToast(request, {
              success: {
                title: "Run stopped",
                description: `You've successfully stopped the run`,
              },
            }),
          },
        }
      );
    },
  })(actionArgs);
}
