import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");
    invariant(params.runId, "runId not found");

    return redirect(
      routes.pipelineRunOverview(
        params.organizationId,
        params.pipelineId,
        params.runId
      )
    );
  })(args);
}
