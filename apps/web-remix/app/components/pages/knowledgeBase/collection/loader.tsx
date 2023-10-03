import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseFileListResponse } from "../contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");

    const knowledgeBase = await fetch(
      KnowledgeBaseFileListResponse,
      `/organizations/${params.organizationId}/memories?collection_name=${params.collectionName}`
    );

    return json({
      fileList: knowledgeBase.data,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
    });
  })(args);
}
