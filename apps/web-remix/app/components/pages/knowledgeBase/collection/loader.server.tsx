import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";

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

    const knowledgeBase = await knowledgeBaseApi.getCollectionMemories(
      params.organizationId,
      collectionId
    );

    return json({
      fileList: knowledgeBase.data,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
    });
  })(args);
}
