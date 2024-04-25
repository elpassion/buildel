import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";
import { IKnowledgeBaseSearchChunk, IKnowledgeBaseSearchChunkMeta } from "~/api/knowledgeBase/knowledgeApi.contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");

    const url = new URL(request.url);
    const query = url.searchParams.get("query") ?? undefined;
    const limit = url.searchParams.get("limit") ?? undefined;
    const token_limit = url.searchParams.get("token_limit") ?? undefined;
    const extend_neighbors = url.searchParams.get("extend_neighbors") ?? undefined;
    const extend_parents = url.searchParams.get("extend_parents") ?? undefined;

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName
    );

    let chunks: IKnowledgeBaseSearchChunk[] = [];
    let metadata: IKnowledgeBaseSearchChunkMeta = { total_tokens: 0 };
    if (query) {
      const { data } = await knowledgeBaseApi.searchCollectionChunks(
        params.organizationId,
        collectionId,
        {
          query,
          limit: limit ? parseInt(limit) : undefined,
          token_limit: token_limit ? parseInt(token_limit) : undefined,
          extend_neighbors: extend_neighbors === "on" ? "true" : "false",
          extend_parents: extend_parents === "on" ? "true" : "false",
        }
      );

      chunks = data.data;
      metadata = data.meta;
    }

    return json({
      query,
      chunks,
      metadata,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
    });
  })(args);
}
