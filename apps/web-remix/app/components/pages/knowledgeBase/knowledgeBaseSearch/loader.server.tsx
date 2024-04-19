import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";
import { IKnowledgeBaseSearchChunk } from "~/api/knowledgeBase/knowledgeApi.contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");

    const url = new URL(request.url);
    const query = url.searchParams.get("query") ?? undefined;

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName
    );

    let chunks: IKnowledgeBaseSearchChunk[] = [];
    if (query) {
      const { data } = await knowledgeBaseApi.searchCollectionChunks(
        params.organizationId,
        collectionId,
        { query }
      );

      chunks = data;
    }

    return json({
      query,
      chunks,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
    });
  })(args);
}
