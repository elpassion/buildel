import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import type { DataFunctionArgs} from "@remix-run/node";

export async function loader(loaderArgs: DataFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    const pipelineApi = new PipelineApi(fetch);

    const alias = pipelineApi.getAliasFromUrl(request.url);

    return redirect(
      routes.pipelineClientSDK(params.organizationId, params.pipelineId, {
        alias,
      })
    );
  })(loaderArgs);
}
