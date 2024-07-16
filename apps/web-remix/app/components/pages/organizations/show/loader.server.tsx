import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    return redirect(routes.pipelines(params.organizationId));
  })(args);
}
