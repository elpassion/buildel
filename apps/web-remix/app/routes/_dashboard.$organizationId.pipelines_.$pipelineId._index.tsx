import { DataFunctionArgs, redirect } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { routes } from "~/utils/routes.utils";

export async function loader(loaderArgs: DataFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    return redirect(
      routes.pipelineBuild(params.organizationId, params.pipelineId)
    );
  })(loaderArgs);
}
