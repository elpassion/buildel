import { fetchTyped } from "~/utils/fetch.server";
import { buildUrlWithParams } from "~/utils/url";
import {
  KnowledgeBaseCollectionFromListResponse,
  KnowledgeBaseCollectionListResponse,
  KnowledgeBaseFileListResponse,
  MemoryChunksResponse,
  CreateCollectionSchema,
  UpdateCollectionSchema,
  KnowledgeBaseSearchChunkResponse,
  IKnowledgeBaseSearchChunk,
} from "./knowledgeApi.contracts";
import { PaginationQueryParams } from "~/components/pagination/usePagination";
import { z } from "zod";

export class KnowledgeBaseApi {
  constructor(private client: typeof fetchTyped) { }

  async getCollections(organizationId: string | number) {
    return this.client(
      KnowledgeBaseCollectionListResponse,
      `/organizations/${organizationId}/memory_collections`
    );
  }

  async getCollectionByName(
    organizationId: string | number,
    collectionName: string | number
  ) {
    return this.client(
      KnowledgeBaseCollectionFromListResponse,
      `/organizations/${organizationId}/memory_collections?collection_name=${collectionName}`
    );
  }

  async deleteCollection(
    organizationId: string | number,
    collectionId: string | number
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: "DELETE" }
    );
  }

  async getCollectionMemories(
    organizationId: string | number,
    collectionId: string | number
  ) {
    return this.client(
      KnowledgeBaseFileListResponse,
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories`
    );
  }

  async searchCollectionChunks(
    organizationId: string | number,
    collectionId: string | number,
    params: { query?: string, limit?: number, token_limit?: number }
  ) {
    const urlWithParams = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/search`,
      params
    );

    return this.client(KnowledgeBaseSearchChunkResponse, urlWithParams);
  }

  async deleteCollectionMemory(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}`,
      { method: "DELETE" }
    );
  }

  async createCollection(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateCollectionSchema>
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async updateCollection(
    organizationId: string | number,
    collectionId: string | number,
    data: z.TypeOf<typeof UpdateCollectionSchema>
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }

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
