import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { SecretsApi } from "~/api/secrets/SecretsApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const secretsApi = new SecretsApi(fetch);
    const secrets = await secretsApi.getSecrets(params.organizationId);
    return json({
      organizationId: params.organizationId,
      secrets: secrets.data,
    });
  })(args);
}
