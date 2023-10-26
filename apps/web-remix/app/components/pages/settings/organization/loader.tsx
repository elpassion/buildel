import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import invariant from "tiny-invariant";
import { APIKeyResponse } from "./contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const apiKey = await fetch(
      APIKeyResponse,
      `/organizations/${params.organizationId}/api_key`
    );
    return json({ apiKey: apiKey.data });
  })(args);
}
