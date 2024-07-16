import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { KnowledgeBaseCollectionFromListResponse } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";
import { getParamsPagination } from "~/components/pagination/usePagination";
import { requireLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.collectionName, "collectionName not found");
    invariant(params.memoryId, "collectionName not found");

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName
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
