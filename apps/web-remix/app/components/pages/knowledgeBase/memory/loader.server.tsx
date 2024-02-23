import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseCollectionFromListResponse } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { getParamsPagination } from "~/components/pagination/usePagination";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");
    invariant(params.memoryId, "collectionName not found");

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await fetch(
      KnowledgeBaseCollectionFromListResponse,
      `/organizations/${
        params.organizationId
      }/memory_collections?collection_name=${encodeURIComponent(
        params.collectionName
      )}`
    );

    const { page, per_page, search } = getParamsPagination(
      new URL(request.url).searchParams
    );

    const { data: chunks } = await knowledgeBaseApi.getMemoryChunk(
      params.organizationId,
      collectionId,
      params.memoryId,
      { page, per_page, search }
    );

    const totalItems = chunks.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);

    return json({
      chunks: chunks.data,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      memoryId: params.memoryId,
      pagination: { page, per_page, search, totalItems, totalPages },
    });
  })(args);
}
