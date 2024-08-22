import { z } from 'zod';

import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import {
  KnowledgeBaseCollectionCostResponse,
  KnowledgeBaseCollectionFromListResponse,
  KnowledgeBaseCollectionListResponse,
  KnowledgeBaseFileListResponse,
  KnowledgeBaseSearchChunkResponse,
  MemoryChunksResponse,
  MemoryGraphResponse,
  MemoryGraphStateResponse,
  MemoryNodeDetailsResponse,
  MemoryNodeRelatedResponse,
} from './knowledgeApi.contracts';
import type {
  CreateCollectionSchema,
  UpdateCollectionSchema,
} from './knowledgeApi.contracts';

type DateQueryParams = {
  start_date: string;
  end_date: string;
};
export class KnowledgeBaseApi {
  constructor(private client: typeof fetchTyped) {}

  async getCollections(organizationId: string | number) {
    return this.client(
      KnowledgeBaseCollectionListResponse,
      `/organizations/${organizationId}/memory_collections`,
    );
  }

  async getCollectionByName(
    organizationId: string | number,
    collectionName: string | number,
  ) {
    return this.client(
      KnowledgeBaseCollectionFromListResponse,
      `/organizations/${organizationId}/memory_collections?collection_name=${collectionName}`,
    );
  }

  async deleteCollection(
    organizationId: string | number,
    collectionId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: 'DELETE' },
    );
  }

  async getCollectionMemories(
    organizationId: string | number,
    collectionId: string | number,
  ) {
    return this.client(
      KnowledgeBaseFileListResponse,
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories`,
    );
  }

  async getCollectionCosts(
    organizationId: string | number,
    collectionId: string | number,
    pagination?: DateQueryParams & PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/costs`,
      { ...pagination },
    );

    return this.client(KnowledgeBaseCollectionCostResponse, url);
  }

  async searchCollectionChunks(
    organizationId: string | number,
    collectionId: string | number,
    params: {
      query?: string;
      limit?: number;
      token_limit?: number;
      extend_neighbors: string | boolean;
      extend_parents: string | boolean;
      memory_id?: number;
    },
  ) {
    const urlWithParams = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/search`,
      params,
    );

    return this.client(KnowledgeBaseSearchChunkResponse, urlWithParams);
  }

  async deleteCollectionMemory(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}`,
      { method: 'DELETE' },
    );
  }

  async createCollection(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateCollectionSchema>,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections`,
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  async updateCollection(
    organizationId: string | number,
    collectionId: string | number,
    data: z.TypeOf<typeof UpdateCollectionSchema>,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: 'PUT', body: JSON.stringify(data) },
    );
  }

  async getMemoryChunk(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}/chunks`,
      { ...pagination },
    );

    return this.client(MemoryChunksResponse, url);
  }

  async getCollectionGraph(
    organizationId: string | number,
    collectionId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs`,
      { ...pagination },
    );

    return this.client(MemoryGraphResponse, url);
  }

  async generateCollectionGraph(
    organizationId: string | number,
    collectionId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs`,
    );

    return this.client(MemoryGraphResponse, url, { method: 'POST' });
  }

  async stopGraphGeneration(
    organizationId: string | number,
    collectionId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs`,
    );

    return this.client(z.any(), url, { method: 'delete' });
  }

  async getCollectionGraphState(
    organizationId: string | number,
    collectionId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs/state`,
    );

    return this.client(MemoryGraphStateResponse, url);
  }

  async getRelatedNeighbours(
    organizationId: string | number,
    collectionId: string | number,
    chunkId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs/related?chunk_id=${chunkId}&limit=5`,
    );

    return this.client(MemoryNodeRelatedResponse, url);
  }

  async getGraphChunkDetails(
    organizationId: string | number,
    collectionId: string | number,
    chunkId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/graphs/details?chunk_id=${chunkId}`,
    );

    return this.client(MemoryNodeDetailsResponse, url);
  }
}
