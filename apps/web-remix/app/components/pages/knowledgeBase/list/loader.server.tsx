import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseCollectionListResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const collections = await fetch(
      KnowledgeBaseCollectionListResponse,
      `/organizations/${params.organizationId}/memory_collections`
    );

    return json({
      organizationId: params.organizationId,
      collections: collections.data,
    });
  })(args);
}
