import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName
    );

    return json({
      collectionId,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      apiUrl: process.env.API_URL!,
    });
  })(args);
}
