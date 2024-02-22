import { fetchTyped } from "~/utils/fetch.server";
import { buildUrlWithParams } from "~/utils/url";
import { MemoryChunksResponse } from "~/components/pages/knowledgeBase/contracts";
import { PaginationQueryParams } from "~/components/pagination/usePagination";

export class KnowledgeBaseApi {
  constructor(private client: typeof fetchTyped) {}

  async getMemoryChunk(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number,
    pagination?: PaginationQueryParams
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}/chunks`,
      { ...pagination }
    );

    return this.client(MemoryChunksResponse, url);
  }
}
