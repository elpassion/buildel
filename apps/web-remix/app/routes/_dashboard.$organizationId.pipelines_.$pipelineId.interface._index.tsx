import { DataFunctionArgs, redirect } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { routes } from "~/utils/routes.utils";
import { getAlias } from "~/components/pages/pipelines/alias.utils";

export async function loader(loaderArgs: DataFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const alias = getAlias(request.url);

    return redirect(
      routes.pipelineClientSDK(params.organizationId, params.pipelineId, {
        alias,
      })
    );
  })(loaderArgs);
}
