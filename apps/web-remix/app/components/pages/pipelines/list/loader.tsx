import { json, LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { PipelinesResponse } from "../contracts";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const pipelines = await fetch(
      PipelinesResponse,
      `/organizations/${params.organizationId}/pipelines`
    );

    return json({
      pipelines: pipelines.data,
      organizationId: params.organizationId,
    });
  })(args);
}
