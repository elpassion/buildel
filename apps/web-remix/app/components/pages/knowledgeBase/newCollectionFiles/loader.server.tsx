import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseCollectionFromListResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");

    const {
      data: { id: collectionId },
    } = await fetch(
      KnowledgeBaseCollectionFromListResponse,
      `/organizations/${params.organizationId}/memory_collections?collection_name=${params.collectionName}`
    );

    return json({
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId,
    });
  })(args);
}
