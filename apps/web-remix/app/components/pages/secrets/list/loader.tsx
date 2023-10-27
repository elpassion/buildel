import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { SecretKeyListResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const secrets = await fetch(
      SecretKeyListResponse,
      `/organizations/${params.organizationId}/secrets`
    );
    return json({
      organizationId: params.organizationId,
      secrets: secrets.data,
    });
  })(args);
}
