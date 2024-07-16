import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import type { DataFunctionArgs} from "@remix-run/node";

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
