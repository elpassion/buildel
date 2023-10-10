import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { ApiKeyListResponse } from "~/components/pages/apiKeys/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    return json({
      organizationId: params.organizationId,
      apiKeys: ApiKeyListResponse.parse({
        data: [{ id: 0, name: "Test", key: "123" }],
      }),
    });
  })(args);
}
